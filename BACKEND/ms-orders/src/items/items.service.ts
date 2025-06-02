import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly httpService: HttpService,
  ) { }

  /**
   * Crea un nuevo ítem:
   * - orderId (UUID) y productId (int) vienen por URL.
   * - createItemDto trae: name, quantity, unitPrice.
   * - totalPrice se calcula como quantity * unitPrice.
   */
  async create(
    orderId: string,
    productId: number,
    createItemDto: CreateItemDto,
  ): Promise<Item> {
    const { quantity } = createItemDto;

    // 1. Validar orden
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException(`El orderId "${orderId}" no existe.`);
    }

    // 2. Obtener datos del producto desde Inventario
    let productData: any;
    try {
      const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
      const prodUrl = `${invBase}/product/${productId}`;
      const resp = await firstValueFrom(this.httpService.get(prodUrl));
      productData = resp.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new BadRequestException(`El productId "${productId}" no existe en Inventario.`);
      }
      throw new BadRequestException(
        `Error validando productId "${productId}" en Inventario.`,
      );
    }

    // 3. Extraer nombre y precio unitario del producto
    const name = productData.name;
    const unitPrice = productData.unitPrice;

    if (!name || unitPrice === undefined || unitPrice === null) {
      throw new BadRequestException('Datos inválidos del producto recibidos desde Inventario.');
    }

    // 4. Calcular totalPrice
    const totalPrice = quantity * unitPrice;

    // 5. Crear entidad Item
    const itemEntity = this.itemRepo.create({
      name,
      quantity,
      unitPrice,
      totalPrice,
      productId,
      order,
    });

    // 6. Guardar en BD
    try {
      return await this.itemRepo.save(itemEntity);
    } catch {
      throw new InternalServerErrorException(
        'Error guardando el ítem en la base de datos.',
      );
    }
  }

  /**
   * Lista todos los ítems.
   */
  async findAll(): Promise<Item[]> {
    return this.itemRepo.find({ relations: ['order'] });
  }

  /**
   * Busca un ítem por su ID.
   */
  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!item) {
      throw new BadRequestException(`No existe ítem con id "${id}".`);
    }
    return item;
  }

  /**
   * Actualiza un ítem:
   * - Solo permite cambiar name, quantity, unitPrice.
   * - totalPrice se recalcula automáticamente.
   * - No permite cambiar order ni productId.
   */
  async update(
    id: string,
    updateData: Partial<CreateItemDto>, // Solo debe traer quantity
  ): Promise<Item> {
    const existing = await this.itemRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!existing) {
      throw new BadRequestException(`No existe ítem con id "${id}".`);
    }

    // Si llega quantity para actualizar, validar que sea >= 1
    if (updateData.quantity !== undefined && updateData.quantity < 1) {
      throw new BadRequestException('La cantidad debe ser al menos 1.');
    }

    // Obtener datos actuales del producto desde Inventario para asegurar nombre y precio
    let productData: any;
    try {
      const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
      const prodUrl = `${invBase}/product/${existing.productId}`;
      const resp = await firstValueFrom(this.httpService.get(prodUrl));
      productData = resp.data;
    } catch (err) {
      throw new BadRequestException(
        `Error obteniendo datos del producto con ID "${existing.productId}" desde Inventario.`,
      );
    }

    const name = productData.name;
    const unitPrice = productData.unitPrice;

    if (!name || unitPrice === undefined || unitPrice === null) {
      throw new BadRequestException('Datos inválidos del producto recibidos desde Inventario.');
    }

    // Merge solo quantity (porque name y unitPrice vienen de Inventario)
    existing.quantity = updateData.quantity ?? existing.quantity;
    existing.name = name;
    existing.unitPrice = unitPrice;

    // Recalcular totalPrice
    existing.totalPrice = existing.quantity * existing.unitPrice;

    try {
      return await this.itemRepo.save(existing);
    } catch {
      throw new InternalServerErrorException('Error al actualizar el ítem.');
    }
  }

  /**
   * Elimina un ítem por su ID.
   */
  async remove(id: string): Promise<void> {
    const existing = await this.itemRepo.findOne({ where: { id } });
    if (!existing) {
      throw new BadRequestException(`No existe ítem con id "${id}".`);
    }
    await this.itemRepo.delete(id);
  }
}
