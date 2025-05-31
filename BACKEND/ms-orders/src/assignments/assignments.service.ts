import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly repo: Repository<Assignment>,
  ) {}

  create(dto: CreateAssignmentDto): Promise<Assignment> {
    const order = this.repo.create(dto);
    return this.repo.save(order);
  }

  findAll(): Promise<Assignment[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Assignment> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Assignment #${id} not found`);
    return order;
  }

  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment> {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.repo.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Assignment #${id} not found`);
    }
  }

}
