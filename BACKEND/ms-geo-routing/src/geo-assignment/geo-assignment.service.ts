import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

import { CreateGeoAssignmentDto } from './dto/create-geo-assignment.dto';
import { UpdateGeoAssignmentDto } from './dto/update-geo-assignment.dto';
import { GeoAssignment } from './entities/geo-assignment.entity';
import { Route } from '../route/entities/route.entity';
import { SegmentService } from '../segment/segment.service';
import { AssignmentService } from '../assignment/assignment.service';
import { ConfigService } from '@nestjs/config';
import { LocationService } from '../location/location.service';

@Injectable()
export class GeoAssignmentService {
  private readonly ordersBaseUrl: string;
  private readonly inventoryBaseUrl: string;
  private readonly googleApiKey: string;

  constructor(
    @InjectRepository(GeoAssignment)
    private readonly geoRepo: Repository<GeoAssignment>,

    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,

    private readonly segmentService: SegmentService,
    private readonly assignmentService: AssignmentService,
    private readonly locationService: LocationService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    // Base URL de ms-Orders
    const ordBase = this.config.get<string>('MS_ORDERS_URL');
    if (!ordBase) {
      throw new Error('MS_ORDERS_URL no configurada en .env');
    }
    this.ordersBaseUrl = ordBase.endsWith('/') ? ordBase : ordBase + '/';

    // Base URL de ms-Inventory
    const invBase = this.config.get<string>('MS_INVENTORY_URL');
    if (!invBase) {
      throw new Error('MS_INVENTORY_URL no configurada en .env');
    }
    this.inventoryBaseUrl = invBase.endsWith('/') ? invBase : invBase + '/';

    // Clave Google Maps (Geocoding + Directions)
    const gKey = this.config.get<string>('GOOGLE_MAPS_API_KEY');
    if (!gKey) {
      throw new Error('GOOGLE_MAPS_API_KEY no configurada en .env');
    }
    this.googleApiKey = gKey;
  }

  /**
   * Crea un GeoAssignment + Route + Segmentos.
   * Pasos:
   * 1) Verificar duplicado.
   * 2) Traer Assignment → extraer userDeliveryDriver y order.store + dirección.
   * 3) Obtener última ubicación del repartidor (LocationService) y calcular distanceToPickup.
   * 4) Obtener lat/lng del almacén (ms-Inventory).
   * 5) Geocodificar dirección del cliente (Google Geocoding).
   * 6) Llamar a Google Directions (almacén → cliente) para distanceMeters, durationSeconds y polyline.
   * 7) Guardar GeoAssignment con distanceToPickup y distanceToDrop.
   * 8) Crear Route asociado a geoAssignmentId.
   * 9) Decodificar polyline y guardar segmentos.
   */
  async create(
    createDto: CreateGeoAssignmentDto,
    token: string,
  ): Promise<GeoAssignment> {
    const { assignmentId } = createDto;

    // ——— 1) Verificar duplicado de GeoAssignment
    const existing = await this.geoRepo.findOne({ where: { assignmentId } });
    if (existing) {
      throw new BadRequestException(
        `Ya existe GeoAssignment para assignmentId=${assignmentId}`,
      );
    }

    // ——— 2) Traer Assignment desde ms-Orders
    let assignmentData: any;
    try {
      const url = `${this.ordersBaseUrl}assignments/${encodeURIComponent(
        assignmentId,
      )}`;
      const resp = await firstValueFrom(
        this.http.get(url, { headers: { Authorization: `Bearer ${token}` } }),
      );
      assignmentData = resp.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) {
          throw new NotFoundException(
            `Assignment #${assignmentId} no existe en ms-Orders.`,
          );
        }
        if (status === 401) {
          throw new BadRequestException(
            `Token inválido o expirado al consultar assignment.`,
          );
        }
      }
      throw new InternalServerErrorException(
        `Error trayendo Assignment #${assignmentId} desde ms-Orders`,
      );
    }

    // Extraer datos relevantes del Assignment
    const order = assignmentData.order;
    if (
      !order ||
      typeof order.storeId !== 'number' ||
      !assignmentData.userDeliveryDriver
    ) {
      throw new BadRequestException(
        `El Assignment #${assignmentId} no contiene información válida (store o userDeliveryDriver).`,
      );
    }
    const driverUserId: string = assignmentData.userDeliveryDriver;
    const storeId: number = order.storeId;

    // Construir dirección completa del cliente
    const address1: string = order.address1 || '';
    const address2: string = order.address2 || '';
    const city: string = order.city || '';
    const department: string = order.department || '';
    const fullAddress = `${address1} ${address2}, ${city}, ${department}`.trim();

    // ——— 3 y 4) Obtener lat/lng del almacén (ms-Inventory) Y calcular distanceToPickup
    let storeLat = 0;
    let storeLng = 0;
    let distanceToPickup = 0;

    try {
      // A) Primero obtenemos las coordenadas del almacén
      const storeUrl = `${this.inventoryBaseUrl}store/${storeId}`;
      const storeResp = await firstValueFrom(
        this.http.get(storeUrl, { headers: { Authorization: `Bearer ${token}` } }),
      );
      storeLat = storeResp.data.latitude;
      storeLng = storeResp.data.longitude;

      // B) Luego pedimos la última ubicación del repartidor
      const driverLoc = await this.locationService.findLatestByUser(
        driverUserId,
      );
      if (!driverLoc) {
        // Si no hay ubicación registrada, distanceToPickup queda 0
        distanceToPickup = 0;
      } else if (
        typeof driverLoc.latitude !== 'number' ||
        typeof driverLoc.longitude !== 'number'
      ) {
        throw new Error('Ubicación del repartidor inválida');
      } else {
        // Calculamos la distancia Haversine entre repartidor y almacén
        distanceToPickup = this.calculateHaversine(
          driverLoc.latitude,
          driverLoc.longitude,
          storeLat,
          storeLng,
        );
      }
    } catch (err: unknown) {
      // Si falla la petición a ms-Inventory (404, 401, etc.), lanzamos la excepción apropiada.
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) {
          throw new NotFoundException(`Store #${storeId} no existe.`);
        }
        if (status === 401) {
          throw new UnauthorizedException(
            'Token inválido o expirado al consultar store.',
          );
        }
      }
      // Si es otro error (por ejemplo, la lat/lng del repartidor no es válida),
      // registramos en consola y dejamos distanceToPickup = 0
      console.error('Error al calcular distanceToPickup o al traer Store:', err);
      distanceToPickup = 0;
      // NOTA: no re-lanzamos aquí, porque queremos que siga el flujo y
      // se cree igual el GeoAssignment con distanceToPickup = 0.
      // Si prefieres abortar la creación, puedes quitar estas dos líneas y lanzar InternalServerErrorException.
    }

    // ——— 5) Geocoding (Google) para convertir dirección del cliente en lat/lng
    let clientLat: number;
    let clientLng: number;
    try {
      console.log(fullAddress)
      const geocodeUrl =
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress,
        )}&key=${this.googleApiKey}`;
      const geoResp = await firstValueFrom(this.http.get(geocodeUrl));

      // Verificamos respuesta de Google
      if (
        geoResp.data.status === 'OK' &&
        Array.isArray(geoResp.data.results) &&
        geoResp.data.results.length > 0
      ) {
        const location = geoResp.data.results[0].geometry.location;
        clientLat = location.lat;
        clientLng = location.lng;
      } else {
        // Si Google responde distinto a OK (ZERO_RESULTS, OVER_QUERY_LIMIT, etc.)
        const errorMessage = geoResp.data.error_message || '';
        throw new Error(`Geocoding falló: ${geoResp.data.status} ${errorMessage}`);
      }
    } catch (err: unknown) {
      console.error('Error en Geocoding:', err);
      throw new InternalServerErrorException(
        `Error haciendo Geocoding para "${fullAddress}"`,
      );
    }

    // ——— 6) Llamar a Google Directions API (almacén → cliente)
    let distanceMeters: number;
    let durationSeconds: number;
    let encodedPolyline = '';
    try {
      console.log(`Llamando a Google Directions API para: ${storeLat},${storeLng} → ${clientLat},${clientLng}`);
      const directionsUrl =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${storeLat},${storeLng}` +
        `&destination=${clientLat},${clientLng}&key=${this.googleApiKey}`;
      const dirResp = await firstValueFrom(this.http.get(directionsUrl));

      // Validamos status de la respuesta (OK, ZERO_RESULTS, etc.)
      if (dirResp.data.status !== 'OK') {
        const errMsg = dirResp.data.error_message || '';
        throw new BadRequestException(
          `Google Directions API devolvió status=${dirResp.data.status}. ${errMsg}`,
        );
      }

      // Ahora verificamos que existan rutas y legs
      if (!Array.isArray(dirResp.data.routes) || dirResp.data.routes.length === 0) {
        throw new BadRequestException('No se encontraron rutas en Google Directions');
      }
      const firstRoute = dirResp.data.routes[0];
      if (!Array.isArray(firstRoute.legs) || firstRoute.legs.length === 0) {
        throw new BadRequestException('La ruta de Google Directions no contiene legs válidos');
      }

      const leg = firstRoute.legs[0];
      distanceMeters = leg.distance.value;
      durationSeconds = leg.duration.value;
      encodedPolyline = firstRoute.overview_polyline.points;
    } catch (err: unknown) {
      // Diferenciamos BadRequestException (400) de otros errores de red o internos
      if (err instanceof BadRequestException) {
        // Re-lanzamos tal cual para que el consumidor (controller) reciba 400 con el mensaje específico
        throw err;
      }
      console.error('Error invocando Google Directions API:', err);
      throw new InternalServerErrorException(
        `Error al invocar Google Directions API: ${(err as Error).message}`,
      );
    }

    // distanceToDrop = distancia de almacén → cliente
    const distanceToDrop = distanceMeters;

    // ——— 7) Guardar GeoAssignment
    const geoEntity = this.geoRepo.create({
      assignmentId,
      distanceToPickup,
      distanceToDrop,
    });

    let savedGeo: GeoAssignment;
    try {
      savedGeo = await this.geoRepo.save(geoEntity);
    } catch (err) {
      console.error('Error guardando GeoAssignment en BD:', err);
      throw new InternalServerErrorException(
        'Error guardando GeoAssignment en BD',
      );
    }

    // ——— 8) Crear Route asociado
    const routeEntity = this.routeRepo.create({
      geoAssignmentId: savedGeo.geoAssignmentId,
      originLat: storeLat,
      originLng: storeLng,
      destinationLat: clientLat,
      destinationLng: clientLng,
      distanceMeters,
      durationSeconds,
      pickupFromStore: storeId,
    });

    let savedRoute: Route;
    try {
      savedRoute = await this.routeRepo.save(routeEntity);
    } catch (err) {
      console.error('Error guardando Route en BD:', err);
      throw new InternalServerErrorException('Error guardando Route en BD');
    }

    // Vinculamos en memoria para devolverlo
    savedGeo.route = savedRoute;

    // ——— 9) Decodificar polyline y guardar segmentos
    if (encodedPolyline) {
      // npm install @mapbox/polyline
      const polyline = require('@mapbox/polyline');
      const decoded: Array<[number, number]> = polyline.decode(encodedPolyline);

      // Guardamos cada punto como segmento
      for (let i = 0; i < decoded.length; i++) {
        const [lat, lng] = decoded[i];
        await this.segmentService.create(savedRoute.routeId, {
          sequence: i,
          latitude: lat,
          longitude: lng,
        });
      }
    }

    return savedGeo;
  }

  /** Devuelve todos los GeoAssignments con Route y segmentos. */
  async findAll(): Promise<GeoAssignment[]> {
    return this.geoRepo.find({ relations: ['route', 'route.segments'] });
  }

  /** Devuelve un GeoAssignment por ID (con Route y segmentos). */
  async findOne(id: number): Promise<GeoAssignment> {
    const geo = await this.geoRepo.findOne({
      where: { geoAssignmentId: id },
      relations: ['route', 'route.segments'],
    });
    if (!geo) {
      throw new NotFoundException(`GeoAssignment #${id} no encontrado`);
    }
    return geo;
  }

  /** Actualiza únicamente distanceToPickup y/o distanceToDrop. */
  async update(
    id: number,
    updateDto: UpdateGeoAssignmentDto,
  ): Promise<GeoAssignment> {
    const geo = await this.findOne(id);
    if (typeof updateDto.distanceToPickup === 'number') {
      geo.distanceToPickup = updateDto.distanceToPickup;
    }
    if (typeof updateDto.distanceToDrop === 'number') {
      geo.distanceToDrop = updateDto.distanceToDrop;
    }
    try {
      return await this.geoRepo.save(geo);
    } catch {
      throw new InternalServerErrorException(
        `Error actualizando GeoAssignment #${id}`,
      );
    }
  }

  /** Elimina un GeoAssignment (cascade borra Route y segmentos). */
  async remove(id: number): Promise<void> {
    const geo = await this.findOne(id);
    try {
      await this.geoRepo.remove(geo);
    } catch {
      throw new InternalServerErrorException(
        `Error eliminando GeoAssignment #${id}`,
      );
    }
  }

  /**
   * Calcula la distancia Haversine (en metros) entre dos coordenadas.
   */
  private calculateHaversine(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371000; // radio de la Tierra en metros
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
