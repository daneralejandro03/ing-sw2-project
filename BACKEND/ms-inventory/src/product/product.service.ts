import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AlertService } from './alert.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly alertService: AlertService,
    @InjectRepository(Product) private readonly repo: Repository<Product>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,

  ) { }

  async create(categoryId: number, dto: CreateProductDto): Promise<Product> {
    const category = await this.catRepo.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category #${categoryId} not found`);
    }
    const product = this.repo.create({ ...dto, category });
    return this.repo.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.repo.find({ relations: ['category', 'inventory', 'provision'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['category', 'inventory', 'provision'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto, token: string): Promise<Product> {
    const prod = await this.findOne(id);
    Object.assign(prod, dto);
    const saved = await this.repo.save(prod);

    await this.alertService.checkStockAndAlert(saved.id, token);

    return saved;
  }

  async remove(id: number): Promise<void> {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['inventory', 'provision'],
    });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (product.inventory.length > 0) {
      throw new BadRequestException(
        `Cannot delete product ${id} because it has ${product.inventory.length} inventory record(s)`
      );
    }

    if (product.provision.length > 0) {
      throw new BadRequestException(
        `Cannot delete product ${id} because it has ${product.provision.length} provision(s)`
      );
    }

    const res = await this.repo.delete(id);
    if (res.affected === 0) {
      throw new NotFoundException(`Product #${id} not found`);
    }
  }
}

