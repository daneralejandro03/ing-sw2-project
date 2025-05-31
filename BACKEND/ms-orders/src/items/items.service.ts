import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly repo: Repository<Item>,
  ) {}

  create(dto: CreateItemDto): Promise<Item> {
    const order = this.repo.create(dto);
    return this.repo.save(order);
  }

  findAll(): Promise<Item[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Item> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Item #${id} not found`);
    return order;
  }

  async update(id: string, dto: UpdateItemDto): Promise<Item> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.repo.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item #${id} not found`);
    }
  }

}
