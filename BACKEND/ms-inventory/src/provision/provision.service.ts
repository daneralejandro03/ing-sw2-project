import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provision } from './entities/provision.entity';
import { Product } from '../product/entities/product.entity';
import { Supplier } from '../supplier/entities/supplier.entity';

@Injectable()
export class ProvisionService {
  constructor(
    @InjectRepository(Provision)
    private readonly provRepo: Repository<Provision>,
    @InjectRepository(Product)
    private readonly prodRepo: Repository<Product>,
    @InjectRepository(Supplier)
    private readonly suppRepo: Repository<Supplier>,
  ) { }

  async create(productId: number, supplierId: number): Promise<Provision> {
    const product = await this.prodRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product #${productId} not found`);

    const supplier = await this.suppRepo.findOne({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundException(`Supplier #${supplierId} not found`);

    const exists = await this.provRepo.findOne({
      where: { product: { id: productId }, supplier: { id: supplierId } },
    });
    if (exists) {
      throw new BadRequestException(
        `Provision of product ${productId} by supplier ${supplierId} already exists`
      );
    }

    try {
      const prov = this.provRepo.create({ product, supplier });
      return await this.provRepo.save(prov);
    } catch (err) {
      throw new InternalServerErrorException(`Error creating provision: ${err}`);
    }
  }

  findAll(): Promise<Provision[]> {
    return this.provRepo.find({ relations: ['product', 'supplier'] });
  }

  async findOne(id: number): Promise<Provision> {
    const prov = await this.provRepo.findOne({
      where: { id },
      relations: ['product', 'supplier'],
    });
    if (!prov) throw new NotFoundException(`Provision #${id} not found`);
    return prov;
  }

  async remove(id: number): Promise<void> {
    const result = await this.provRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Provision #${id} not found`);
    }
  }

  async findSuppliersByProduct(productId: number): Promise<Supplier[]> {
    const product = await this.prodRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product #${productId} not found`);
    }

    const provisions = await this.provRepo.find({
      where: { product: { id: productId } },
      relations: ['supplier'],
    });

    return provisions.map(p => p.supplier);
  }

  async findProductsBySupplier(supplierId: number): Promise<Product[]> {
    const supplier = await this.suppRepo.findOne({ where: { id: supplierId } });
    if (!supplier) {
      throw new NotFoundException(`Supplier #${supplierId} not found`);
    }

    const provisions = await this.provRepo.find({
      where: { supplier: { id: supplierId } },
      relations: ['product'],
    });

    return provisions.map(p => p.product);
  }
}
