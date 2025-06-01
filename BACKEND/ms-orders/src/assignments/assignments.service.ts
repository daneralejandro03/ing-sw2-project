import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    private readonly httpService: HttpService,
  ) { }

  /**
   * Crea una nueva asignación:
   * - orderId (UUID) y userDeliveryDriver (ObjectId Mongo) vienen por URL.
   * - createAssignmentDto trae: status, note, date.
   * - authToken en header para validar driver en Seguridad y verificar rol.
   */
  async create(
    orderId: string,
    userDeliveryDriver: string,
    createAssignmentDto: CreateAssignmentDto,
    authToken: string,
  ): Promise<Assignment> {
    const { status, note, date } = createAssignmentDto;

    if (!authToken || !authToken.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto para llamadas a Seguridad.');
    }

    // 1. Verificar que la orden exista (en BD local)
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException(`La orden con id "${orderId}" no existe.`);
    }

    const secBase = process.env.SECURITY_SERVICE_URL.replace(/\/$/, '');

    // 2. Obtener datos del usuario repartidor desde Security Service
    let userData: any;
    try {
      const userUrl = `${secBase}/user/${userDeliveryDriver}`;
      const resp = await firstValueFrom(
        this.httpService.get(userUrl, {
          headers: { Authorization: authToken },
        }),
      );
      userData = resp.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new BadRequestException(
          `El repartidor "${userDeliveryDriver}" no existe en Seguridad.`,
        );
      }
      throw new BadRequestException(
        `Error validando repartidor "${userDeliveryDriver}" en Seguridad.`,
      );
    }

    // 3. Extraer roleId del usuario y obtener nombre del rol
    const roleId = userData.role;
    if (!roleId) {
      throw new BadRequestException(`El usuario "${userDeliveryDriver}" no tiene rol asignado.`);
    }

    let roleData: any;
    try {
      const roleUrl = `${secBase}/role/${roleId}`;
      const respRole = await firstValueFrom(
        this.httpService.get(roleUrl, {
          headers: { Authorization: authToken },
        }),
      );
      roleData = respRole.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new BadRequestException(
          `El roleId "${roleId}" no existe en Seguridad.`,
        );
      }
      throw new BadRequestException(
        `Error consultando el rol "${roleId}" en Seguridad.`,
      );
    }

    // 4. Verificar que el nombre del rol sea "DeliveryDriver"
    if (roleData.name !== 'DeliveryDriver') {
      throw new BadRequestException(
        `El usuario "${userDeliveryDriver}" no tiene rol de DeliveryDriver.`,
      );
    }

    // 5. Crear entidad Assignment
    const assignmentEntity = this.assignmentRepo.create({
      date,
      status,
      note,
      userDeliveryDriver,
      order, // TypeORM asigna orderId
    });

    // 6. Guardar en BD
    try {
      return await this.assignmentRepo.save(assignmentEntity);
    } catch {
      throw new InternalServerErrorException('Error guardando la asignación.');
    }
  }

  async findAll(): Promise<Assignment[]> {
    return this.assignmentRepo.find({ relations: ['order'] });
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!assignment) {
      throw new BadRequestException(`No existe assignment con id "${id}".`);
    }
    return assignment;
  }

  async update(
    id: string,
    updateData: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    const existing = await this.assignmentRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!existing) {
      throw new BadRequestException(`No existe assignment con id "${id}".`);
    }

    // No permitir cambiar userDeliveryDriver ni orderId aquí
    delete (updateData as any).userDeliveryDriver;

    const merged = this.assignmentRepo.merge(existing, updateData);
    try {
      return await this.assignmentRepo.save(merged);
    } catch {
      throw new InternalServerErrorException('Error al actualizar la asignación.');
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.assignmentRepo.findOne({ where: { id } });
    if (!existing) {
      throw new BadRequestException(`No existe assignment con id "${id}".`);
    }
    await this.assignmentRepo.delete(id);
  }
}
