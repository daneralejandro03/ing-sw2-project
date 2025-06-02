// src/routes/route.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Route } from './entities/route.entity';
import { ConfigService } from '@nestjs/config';
import { GeoAssignmentService } from '../geo-assignment/geo-assignment.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class RouteService {
  private readonly inventoryBaseUrl: string;
  private readonly googleApiKey: string;

  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,

    private readonly http: HttpService,
    private readonly config: ConfigService,

    @Inject(forwardRef(() => GeoAssignmentService))
    private readonly geoAssignmentService: GeoAssignmentService, // para validar existencia
  ) {
    // URL base de ms-Inventory
    const invBase = this.config.get<string>('MS_INVENTORY_URL');
    if (!invBase) {
      throw new Error('MS_INVENTORY_URL no configurada');
    }
    this.inventoryBaseUrl = invBase.endsWith('/') ? invBase : invBase + '/';

    // Clave Google Maps
    const gKey = this.config.get<string>('GOOGLE_MAPS_API_KEY');
    if (!gKey) {
      throw new Error('GOOGLE_MAPS_API_KEY no configurada');
    }
    this.googleApiKey = gKey;
  }

  /**
   * Crea una nueva ruta asociada a un GeoAssignment:
   *  1) Verificar que geoAssignment exista (llamando a GeoAssignmentService).
   *  2) Validar que pickupFromStore exista en ms-Inventory → extraer originLat/originLng.
   *  3) Llamar a Google Directions API (origin→destination) → obtener distancia/duración.
   *  4) Persistir la entidad Route con geoAssignmentId.
   *
   * @param geoAssignmentId ID del GeoAssignment (viene por URL)
   * @param createDto Datos { destinationLat, destinationLng, pickupFromStore }
   * @param token Bearer <token> para ms-Inventory (y opcionalmente ms-Security)
   */
  async create(
    geoAssignmentId: number,
    createDto: CreateRouteDto,
    token: string,
  ): Promise<Route> {
    const { destinationLat, destinationLng, pickupFromStore } = createDto;

    // 1) Verificar que GeoAssignment exista (lanzar NotFound si no)
    try {
      await this.geoAssignmentService.findOne(geoAssignmentId);
    } catch {
      throw new BadRequestException(
        `GeoAssignment #${geoAssignmentId} no existe. No puedes crear ruta sin GeoAssignment.`,
      );
    }

    // 2) Obtener originLat/originLng desde ms-Inventory (GET /store/{storeId})
    let originLat: number;
    let originLng: number;
    try {
      const storeUrl = `${this.inventoryBaseUrl}store/${pickupFromStore}`;
      const resp = await firstValueFrom(
        this.http.get(storeUrl, { headers: { Authorization: `Bearer ${token}` } }),
      );
      originLat = resp.data.latitude;
      originLng = resp.data.longitude;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) {
          throw new NotFoundException(`Store #${pickupFromStore} no existe`);
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado al consultar store');
        }
      }
      throw new InternalServerErrorException(
        `Error al obtener store #${pickupFromStore} desde ms-Inventory`,
      );
    }

    // 3) Llamada a Google Directions API (origin→destination)
    let distanceMeters: number;
    let durationSeconds: number;
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}` +
        `&destination=${destinationLat},${destinationLng}&key=${this.googleApiKey}`;
      const resp = await firstValueFrom(this.http.get(url));

      if (resp.data.routes?.length > 0) {
        const leg = resp.data.routes[0].legs[0];
        distanceMeters = leg.distance.value;
        durationSeconds = leg.duration.value;
      } else {
        throw new Error('No se encontraron rutas en Google Directions');
      }
    } catch (_err) {
      throw new InternalServerErrorException(
        'Error al calcular distancia/duración con Google Directions API',
      );
    }

    // 4) Crear y guardar la entidad Route con geoAssignmentId obligatorio
    const routeEntity = this.routeRepo.create({
      geoAssignmentId,      // viene por URL
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      distanceMeters,
      durationSeconds,
      pickupFromStore,
    });

    try {
      return await this.routeRepo.save(routeEntity);
    } catch (err) {
      throw new InternalServerErrorException('Error al crear ruta en la BD');
    }
  }

  /**
   * Retorna todas las rutas (incluye segmentos si eager: true).
   */
  async findAll(): Promise<Route[]> {
    return this.routeRepo.find();
  }

  /**
   * Retorna una ruta por ID (lanza NotFound si no existe).
   */
  async findOne(id: number): Promise<Route> {
    const route = await this.routeRepo.findOne({ where: { routeId: id } });
    if (!route) {
      throw new NotFoundException(`Route #${id} no encontrada`);
    }
    return route;
  }

  /**
   * Actualiza campos permitidos de la ruta.
   * NO permite cambiar geoAssignmentId: la ruta siempre pertenece al mismo GeoAssignment.
   */
  async update(id: number, updateDto: UpdateRouteDto): Promise<Route> {
    const route = await this.findOne(id);

    if (typeof updateDto.destinationLat === 'number') {
      route.destinationLat = updateDto.destinationLat;
    }
    if (typeof updateDto.destinationLng === 'number') {
      route.destinationLng = updateDto.destinationLng;
    }
    if (typeof updateDto.pickupFromStore === 'number') {
      route.pickupFromStore = updateDto.pickupFromStore;
      // Podrías volver a llamar a ms-Inventory y recalcular originLat/originLng y distancia
    }

    try {
      return await this.routeRepo.save(route);
    } catch (err) {
      throw new InternalServerErrorException(`Error actualizando Route #${id}`);
    }
  }

  /**
   * Elimina una ruta (y cascada de segmentos si existen).
   */
  async remove(id: number): Promise<void> {
    const route = await this.findOne(id);
    try {
      await this.routeRepo.remove(route);
    } catch (err) {
      throw new InternalServerErrorException(`Error eliminando Route #${id}`);
    }
  }

  /**
   * Obtener detalles completos del store (opcional).
   */
  async getStoreDetails(storeId: number, token: string): Promise<any> {
    const url = `${this.inventoryBaseUrl}store/${storeId}`;
    try {
      const resp = await firstValueFrom(
        this.http.get(url, { headers: { Authorization: `Bearer ${token}` } }),
      );
      return resp.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404) {
          throw new NotFoundException(`Store #${storeId} no existe`);
        }
        if (status === 401) {
          throw new UnauthorizedException('Token inválido o expirado al validar store');
        }
      }
      throw new InternalServerErrorException(
        `Error obteniendo store #${storeId} desde ms-Inventory`,
      );
    }
  }
}
