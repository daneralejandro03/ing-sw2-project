// src/items/items.service.ts

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
    const { name, quantity, unitPrice } = createItemDto;
    const totalPrice = quantity * unitPrice;

    // 1. Validar que la orden exista (buscando en la DB local)
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException(`El orderId "${orderId}" no existe.`);
    }

    // 2. Validar que el producto exista en Inventory Service
    try {
      const invBase = process.env.INVENTORY_SERVICE_URL.replace(/\/$/, '');
      const prodUrl = `${invBase}/product/${productId}`;
      await firstValueFrom(this.httpService.get(prodUrl));
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 404) {
        throw new BadRequestException(
          `El productId "${productId}" no existe en Inventario.`,
        );
      }
      throw new BadRequestException(
        `Error validando productId "${productId}" en Inventario.`,
      );
    }

    // 3. Crear la entidad Item y asignar relación con Order
    const itemEntity = this.itemRepo.create({
      name,
      quantity,
      unitPrice,
      totalPrice,
      productId,
      order,
    });

    // 4. Persistir en BD
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
    updateData: Partial<CreateItemDto>,
  ): Promise<Item> {
    const existing = await this.itemRepo.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!existing) {
      throw new BadRequestException(`No existe ítem con id "${id}".`);
    }

    // Merge de campos permitidos
    const merged = this.itemRepo.merge(existing, updateData);

    // Recalcular totalPrice si cambian quantity o unitPrice
    merged.totalPrice = merged.quantity * merged.unitPrice;

    try {
      return await this.itemRepo.save(merged);
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
