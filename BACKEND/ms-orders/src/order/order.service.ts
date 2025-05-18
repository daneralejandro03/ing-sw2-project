import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { CreateOrderDTO } from './dto/create-order.dto';
import { UpdateOrderDTO } from './dto/update-order.dto';
import { User } from './common/interfaces/user.interface';
import { Product } from './common/interfaces/product.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
    private readonly httpService: HttpService,
  ) {}

  private readonly securityBaseUrl = process.env.SECURITY_MS;
  private readonly inventoryBaseUrl = process.env.INVENTORY_MS;
  private readonly notificationsBaseUrl = process.env.NOTIFICATIONS_MS;

  private getAuthHeaders(token: string) {
    if (!token) {
      throw new Error('Token JWT requerido para comunicación con ms-security');
    }
    return {
      Authorization: token,
    };
  }

  private async getProductById(idProduct: number, token: string): Promise<Product> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Product>(`${this.inventoryBaseUrl}/product/${idProduct}`, {
          headers: this.getAuthHeaders(token),
        }),
      );
      if (!response.data) throw new NotFoundException(`Producto #${idProduct} no encontrado`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error consultando producto #${idProduct} en ms-inventory`,
        error.response?.data || error.message,
      );
      throw new NotFoundException(`Producto #${idProduct} no encontrado en inventario`);
    }
  }

  private async sendOrderStatusEmail(to: string, subject: string, body: string, token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.notificationsBaseUrl}/email/send`,
          { address: to, subject, plainText: body },
          { headers: this.getAuthHeaders(token) },
        ),
      );
    } catch (error) {
      this.logger.warn('Fallo al enviar correo de estado de orden', error.response?.data || error.message);
    }
  }

  async create(dto: CreateOrderDTO, currentUserId: string, token: string): Promise<OrderEntity> {
    if (!currentUserId) throw new ForbiddenException('Usuario no autenticado');
    if (!token) throw new ForbiddenException('Token no proporcionado');

    let userResponse;
    try {
      userResponse = await firstValueFrom(
        this.httpService.get<User>(`${this.securityBaseUrl}/users/${dto.idUser}`, {
          headers: this.getAuthHeaders(token),
        }),
      );
    } catch (error) {
      this.logger.error('Error consultando usuario en ms-security', error.response?.data || error.message);
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!userResponse.data) throw new NotFoundException('Usuario no encontrado');

    const product = await this.getProductById(+dto.idProduct, token);

    const deliveryDriverId = await this.getDeliveryDriverAvailable(token);
    if (!deliveryDriverId) throw new BadRequestException('No hay repartidores disponibles actualmente');

    const order = this.repo.create({
      ...dto,
      state: 'pendiente',
      deliveryDriver: deliveryDriverId,
    });

    const savedOrder = await this.repo.save(order);

    await this.sendOrderStatusEmail(
      userResponse.data.email,
      'Estado de tu pedido',
      `Tu orden del producto ${product.name} ha sido registrada con estado pendiente.`,
      token,
    );

    return savedOrder;
  }

  async list(token: string): Promise<OrderEntity[]> {
    if (!token) throw new ForbiddenException('Token no proporcionado');
    return this.repo.find();
  }

  async get(id: string, token: string): Promise<OrderEntity> {
    if (!token) throw new ForbiddenException('Token no proporcionado');
    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  private async getDeliveryDriverAvailable(token: string): Promise<string | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<any[]>(`${this.securityBaseUrl}/users/roles/deliveryDriver`, {
          headers: this.getAuthHeaders(token),
        }),
      );

      const deliveryDrivers = response.data;
      if (!deliveryDrivers || deliveryDrivers.length === 0) return null;

      const charges = await Promise.all(
        deliveryDrivers.map(async (rep) => {
          const count = await this.repo.count({ where: { deliveryDriver: rep.id } });
          return { id: rep.id, orders: count };
        }),
      );

      charges.sort((a, b) => a.orders - b.orders);
      return charges[0].id;
    } catch (error) {
      this.logger.error('Error asignando repartidor:', error.response?.data || error.message);
      return null;
    }
  }

  async update(id: string, dto: UpdateOrderDTO, currentUserId: string, token: string): Promise<OrderEntity> {
    if (!currentUserId) throw new ForbiddenException('Usuario no autenticado');
    if (!token) throw new ForbiddenException('Token no proporcionado');

    const user = await this.getUserFromMsSecurity(currentUserId, token);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (!['Administrator', 'Manager'].includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para actualizar órdenes');
    }

    await this.repo.update(id, dto);

    if (dto.state) {
      const order = await this.get(id, token);
      const userResponse = await firstValueFrom(
        this.httpService.get<User>(`${this.securityBaseUrl}/users/${order.idUser}`, {
          headers: this.getAuthHeaders(token),
        }),
      );

      if (userResponse.data?.email) {
        await this.sendOrderStatusEmail(
          userResponse.data.email,
          'Cambio de estado de tu pedido',
          `El estado de tu pedido #${id} cambió a ${dto.state}.`,
          token,
        );
      }
    }

    return this.get(id, token);
  }

  async delete(id: string, currentUserId: string, token: string): Promise<void> {
    if (!currentUserId) throw new ForbiddenException('Usuario no autenticado');
    if (!token) throw new ForbiddenException('Token no proporcionado');

    const user = await this.getUserFromMsSecurity(currentUserId, token);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.role !== 'Administrator') {
      throw new ForbiddenException('No tienes permisos para eliminar órdenes');
    }

    const order = await this.repo.findOneBy({ id });
    if (!order) throw new NotFoundException('Orden no encontrada');

    await this.repo.delete(id);
  }

  private async getUserFromMsSecurity(userId: string, token: string): Promise<{ id: string; role: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ id: string; role: string }>(`${this.securityBaseUrl}/users/${userId}`, {
          headers: this.getAuthHeaders(token),
        }),
      );
      if (!response.data) throw new NotFoundException('Usuario no encontrado');
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo usuario', error.response?.data || error.message);
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
