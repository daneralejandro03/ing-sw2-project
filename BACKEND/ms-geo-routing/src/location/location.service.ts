import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

import { UserClientService } from '../user-client/user-client.service';
import { RoleClientService } from '../role-client/role-client.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locRepo: Repository<Location>,

    private readonly userClient: UserClientService,
    private readonly roleClient: RoleClientService,
  ) { }

  /**
   * Registra una nueva ubicación para un repartidor (DeliveryDriver).
   *
   * Pasos:
   * 1) Validar que el usuario exista y esté activo (UserClientService.findOne).
   * 2) Obtener nombre de su rol (RoleClientService.getRoleById) y verificar que sea 'DeliveryDriver'.
   * 3) Guardar la entidad Location (userId, latitude, longitude, createdAt).
   */
  async create(
    userId: string,
    token: string,
    createDto: CreateLocationDto,
  ): Promise<Location> {
    // 1) Verificar que el usuario exista y esté activo
    let user;
    try {
      user = await this.userClient.findOne(userId, token);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        // Si no existe o bad request
        throw new BadRequestException(`Usuario #${userId} no existe o está inválido`);
      }
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException('Token inválido o expirado');
      }
      throw err;
    }

    if (!user.estado) {
      throw new BadRequestException(`Usuario #${userId} está inactivo`);
    }

    // 2) Obtener el nombre del rol para validar que sea DeliveryDriver
    let roleInfo;
    try {
      console.log(`Consultando rol para usuario #${userId} con ID de rol ${user.role._id}`);
      roleInfo = await this.roleClient.getRoleById(user.role._id, token);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException(`Rol #${user.role} no existe para el usuario`);
      }
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException('Token inválido o expirado al consultar rol');
      }
      throw err;
    }

    if (roleInfo.name !== 'DeliveryDriver') {
      throw new BadRequestException(
        `Usuario #${userId} no tiene rol DeliveryDriver, tiene rol ${roleInfo.name}`,
      );
    }

    // 3) Todo OK → crear y guardar la ubicación
    const locEntity = this.locRepo.create({
      userId,
      latitude: createDto.latitude,
      longitude: createDto.longitude,
    });

    try {
      return await this.locRepo.save(locEntity);
    } catch (err) {
      throw new InternalServerErrorException('Error al guardar Location en la BD');
    }
  }

  /**
   * Devuelve todas las ubicaciones de un usuario (repartidor) ordenadas por fecha descendente.
   */
  async findAllByUser(userId: string): Promise<Location[]> {
    return this.locRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByUser(userId: string): Promise<Location | null> {
    const locs = await this.locRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 1, // Solo queremos la más reciente
    });
    return locs.length > 0 ? locs[0] : null; // Devuelve null si no hay ubicaciones
  }

  /**
   * Opcional: devolver una ubicación por su ID interna.
   */
  async findOne(id: number): Promise<Location> {
    const loc = await this.locRepo.findOne({ where: { _locationId: id } });
    if (!loc) {
      throw new NotFoundException(`Location #${id} no encontrada`);
    }
    return loc;
  }

  /**
   * Opcional: eliminar una ubicación (por ejemplo, para pruebas).
   */
  async remove(id: number): Promise<void> {
    const loc = await this.findOne(id);
    try {
      await this.locRepo.remove(loc);
    } catch (err) {
      throw new InternalServerErrorException(`Error eliminando Location #${id}`);
    }
  }
}
