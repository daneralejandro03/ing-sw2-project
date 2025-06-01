import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { Segment } from './entities/segment.entity';
import { Route } from '../route/entities/route.entity';

@Injectable()
export class SegmentService {
  constructor(
    @InjectRepository(Segment)
    private readonly segRepo: Repository<Segment>,

    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
  ) { }

  /**
   * Crea un nuevo segmento asociado a una ruta específica.
   * - Se espera que la ruta exista; si no, se lanza NotFoundException.
   * @param routeId ID de la ruta (se recibe por URL)
   * @param createDto DTO con sequence, latitude, longitude
   */
  async create(
    routeId: number,
    createDto: CreateSegmentDto,
  ): Promise<Segment> {
    // 1) Verificar que la ruta exista
    const route = await this.routeRepo.findOne({
      where: { routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route #${routeId} no encontrada`);
    }

    // 2) Construir la entidad Segment y asociarla a la ruta
    const segment = this.segRepo.create({
      sequence: createDto.sequence,
      latitude: createDto.latitude,
      longitude: createDto.longitude,
      route: route as Route, // como ya la encontramos por ID, la asociamos
    });

    // 3) Guardar en la BD
    try {
      return await this.segRepo.save(segment);
    } catch (err) {
      throw new InternalServerErrorException('Error guardando Segment');
    }
  }

  /**
   * Devuelve todos los segmentos de una ruta dada (ordenados por sequence ascendente).
   */
  async findByRoute(routeId: number): Promise<Segment[]> {
    // Primero, verificar que la ruta exista
    const route = await this.routeRepo.findOne({
      where: { routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route #${routeId} no encontrada`);
    }

    // Buscar todos los segmentos que tengan routeId en la FK
    return this.segRepo.find({
      where: { route: { routeId } as any },
      order: { sequence: 'ASC' },
    });
  }

  /**
   * Devuelve un solo segmento por su ID; lanza NotFoundException si no existe.
   */
  async findOne(id: number): Promise<Segment> {
    const seg = await this.segRepo.findOne({
      where: { segmentId: id },
    });
    if (!seg) {
      throw new NotFoundException(`Segment #${id} no encontrado`);
    }
    return seg;
  }

  /**
   * Actualiza un segmento existente (solo sequence/latitude/longitude).
   */
  async update(
    id: number,
    updateDto: UpdateSegmentDto,
  ): Promise<Segment> {
    const seg = await this.findOne(id);
    if (typeof updateDto.sequence === 'number') {
      seg.sequence = updateDto.sequence;
    }
    if (typeof updateDto.latitude === 'number') {
      seg.latitude = updateDto.latitude;
    }
    if (typeof updateDto.longitude === 'number') {
      seg.longitude = updateDto.longitude;
    }

    try {
      return await this.segRepo.save(seg);
    } catch (err) {
      throw new InternalServerErrorException(`Error actualizando Segment #${id}`);
    }
  }

  /**
   * Elimina un segmento por su ID.
   */
  async removeOne(id: number): Promise<void> {
    const seg = await this.findOne(id);
    try {
      await this.segRepo.remove(seg);
    } catch {
      throw new InternalServerErrorException(`Error eliminando Segment #${id}`);
    }
  }

  /**
   * Elimina todos los segmentos asociados a una ruta.
   */
  async removeByRoute(routeId: number): Promise<void> {
    // Verificar que la ruta exista
    const route = await this.routeRepo.findOne({
      where: { routeId },
    });
    if (!route) {
      throw new NotFoundException(`Route #${routeId} no encontrada`);
    }

    try {
      await this.segRepo.delete({ route: { routeId } as any });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error eliminando segmentos de Route #${routeId}`,
      );
    }
  }
}
