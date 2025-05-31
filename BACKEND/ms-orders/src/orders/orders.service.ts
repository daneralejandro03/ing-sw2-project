import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Assignment } from 'src/assignments/entities/assignment.entity';
import { Item } from 'src/items/entities/item.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
    @InjectRepository(Item) private readonly itemsRepo: Repository<Item>,
    @InjectRepository(Assignment)
    private readonly assignmentsRepo: Repository<Assignment>,
  ) {}

  create(dto: CreateOrderDto): Promise<Order> {
    const order = this.repo.create(dto);
    return this.repo.save(order);
  }

  findAll(): Promise<Order[]> {
  return this.repo.find({
    relations: ['items', 'assignments'],
  });
}


  async findOne(id: string): Promise<Order> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);
    return order;
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.repo.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order #${id} not found`);
    }
  }

  async associateItem(orderId: string, itemId: string): Promise<Item> {
    const order = await this.findOne(orderId);
    if (!order) throw new NotFoundException(`Order #${orderId} not found`);

    const item = await this.itemsRepo.findOneBy({ id: itemId });
    if (!item) throw new NotFoundException(`Item #${itemId} not found`);

    item.order = order;
    return this.itemsRepo.save(item);
  }

  async associateAssignment(
    orderId: string,
    assignmentId: string,
  ): Promise<Assignment> {
    const order = await this.repo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException(`Order #${orderId} not found`);

    const assignment = await this.assignmentsRepo.findOne({
      where: { id: assignmentId },
    });
    if (!assignment)
      throw new NotFoundException(`Assignment #${assignmentId} not found`);

    assignment.order = order;
    return this.assignmentsRepo.save(assignment);
  }
}
