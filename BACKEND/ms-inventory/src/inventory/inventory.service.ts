import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { Store } from '../store/entities/store.entity';
import { Product } from '../product/entities/product.entity';
import { Motion } from '../motion/entities/motion.entity';
import { Type } from '../motion/enumeration/type.enumeration';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly invRepo: Repository<Inventory>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Product)
    private readonly prodRepo: Repository<Product>,
    @InjectRepository(Motion)
    private readonly motionRepo: Repository<Motion>,
  ) { }

  async create(storeId: number, productId: number): Promise<Inventory> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException(`Store #${storeId} not found`);

    const product = await this.prodRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    const exists = await this.invRepo.findOne({
      where: { store: { id: storeId }, product: { id: productId } },
    });
    if (exists) {
      throw new BadRequestException(
        `Product ${productId} already in inventory of store ${storeId}`
      );
    }

    try {
      // 1) Creamos y salvamos el inventario
      const inv = this.invRepo.create({ store, product });
      const savedInv = await this.invRepo.save(inv);

      const motion = this.motionRepo.create({
        date: new Date(),
        type: Type.IN,
        amount: product.stock,
        inventory: savedInv,
      });
      await this.motionRepo.save(motion);

      return savedInv;
    } catch (err) {
      throw new InternalServerErrorException(`Error creating inventory: ${err}`);
    }
  }

  async findOne(inventoryId: number): Promise<Inventory> {
    const inventory = await this.invRepo.findOne({
      where: { id: inventoryId },
      relations: ['store', 'product'],
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }
    return inventory;
  }

  async findAll(): Promise<Inventory[]> {
    return this.invRepo.find({ relations: ['store', 'product'] });
  }

  async remove(inventoryId: number): Promise<void> {
    const inventory = await this.invRepo.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }

    const result = await this.invRepo.delete(inventoryId);
    if (result.affected === 0) {
      throw new NotFoundException(`Inventory with ID ${inventoryId} not found`);
    }
  }

  async findProductsByStore(storeId: number): Promise<Product[]> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException(`Store #${storeId} not found`);
    }

    const inventories = await this.invRepo.find({
      where: { store: { id: storeId } },
      relations: ['product'],
    });

    return inventories.map(inv => inv.product);
  }
}
