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

import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly httpService: HttpService,
  ) { }

  /**
   * Crea una nueva orden:
   * - userGuestId (ObjectId de MongoDB) y storeId (int) vienen por URL.
   * - Resto de campos en CreateOrderDto (body).
   * - authToken en cabecera para validar userGuestId.
   */
  async create(
    userGuestId: string,
    storeId: number,
    createOrderDto: CreateOrderDto,
    authToken: string,
  ): Promise<Order> {
    if (!authToken || !authToken.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no provisto para llamadas a Seguridad.');
    }

    // 1. Validar que userGuestId exista en el microservicio de Seguridad
    try {
      // Si tu Security expone GET /api/v1/user/:id en lugar de /users/:id, ajusta aquí:
      const secBase = process.env.SECURITY_SERVICE_URL.replace(/\/$/, '');
      const secUrl = `${secBase}/user/${userGuestId}`;
      await firstValueFrom(
        this.httpService.get(secUrl, {
          headers: { Authorization: authToken },
        })
      );
    } catch (err) {
      // Si devuelve 404, significa que el usuario no existe
      if ((err as AxiosError).response?.status === 404) {
        throw new BadRequestException(
          `El userGuestId "${userGuestId}" no existe en Seguridad.`,
        );
      }
      // Cualquier otro error, informamos fallo de validación
      throw new BadRequestException(
        `Error validando userGuestId "${userGuestId}" en Seguridad.`,
      );
    }

    // 2. Validar que storeId exista en el microservicio de Inventario
    try {
      const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
      const invUrl = `${invBase}/store/${storeId}`;
      await firstValueFrom(this.httpService.get(invUrl));
    } catch (err) {
      if ((err as AxiosError).response?.status === 404) {
        throw new BadRequestException(
          `El storeId "${storeId}" no existe en Inventario.`,
        );
      }
      throw new BadRequestException(
        `Error validando storeId "${storeId}" en Inventario.`,
      );
    }

    // 3. Construir entidad Order (sin items ni assignments)
    const orderEntity = this.orderRepo.create({
      status: createOrderDto.status,
      totalAmount: createOrderDto.totalAmount,
      currency: createOrderDto.currency,
      address1: createOrderDto.address1,
      address2: createOrderDto.address2,
      city: createOrderDto.city,
      department: createOrderDto.department,
      postalCode: createOrderDto.postalCode,
      instructions: createOrderDto.instructions,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: createOrderDto.paymentStatus,
      userGuestId,
      storeId,
      items: [],       // inicialmente vacío
      assignments: [], // inicialmente vacío
    });

    try {
      return await this.orderRepo.save(orderEntity);
    } catch {
      throw new InternalServerErrorException(
        'Error persistiendo la orden en la base de datos.',
      );
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException(`No existe orden con id "${id}".`);
    }
    return order;
  }

  async update(
    id: string,
    updateData: Partial<CreateOrderDto>,
    authToken: string,
  ): Promise<Order> {
    const existing = await this.orderRepo.findOne({ where: { id } });
    if (!existing) {
      throw new BadRequestException(`No existe orden con id "${id}".`);
    }

    // No permitir modificar userGuestId ni storeId aquí
    delete (updateData as any).userGuestId;
    delete (updateData as any).storeId;

    const merged = this.orderRepo.merge(existing, updateData);
    try {
      return await this.orderRepo.save(merged);
    } catch {
      throw new InternalServerErrorException(
        'Error al actualizar la orden en la base de datos.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.orderRepo.findOne({ where: { id } });
    if (!existing) {
      throw new BadRequestException(`No existe orden con id "${id}".`);
    }
    await this.orderRepo.delete(id);
  }
}
