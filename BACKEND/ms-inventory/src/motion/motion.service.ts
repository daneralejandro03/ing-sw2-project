import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Motion } from './entities/motion.entity';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class MotionService {
  constructor(
    @InjectRepository(Motion)
    private readonly motionRepo: Repository<Motion>,

    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) { }

  async create(createMotionDto: CreateMotionDto): Promise<Motion> {
    const { date, type, amount, inventoryId } = createMotionDto;

    const inventory = await this.inventoryRepo.findOne({ where: { id: inventoryId } });
    if (!inventory) {
      throw new NotFoundException(`Inventory #${inventoryId} not found`);
    }

    const motion = this.motionRepo.create({
      date: new Date(date),
      type,
      amount,
      inventory,
    });

    return this.motionRepo.save(motion);
  }

  async findAll(): Promise<Motion[]> {
    return this.motionRepo.find({ relations: ['inventory'] });
  }

  async findOne(id: number): Promise<Motion> {
    const motion = await this.motionRepo.findOne({
      where: { id },
      relations: ['inventory'],
    });
    if (!motion) {
      throw new NotFoundException(`Motion #${id} not found`);
    }
    return motion;
  }

  async update(id: number, dto: UpdateMotionDto): Promise<Motion> {
    const motion = await this.motionRepo.preload({
      id,
      ...dto,
    });

    if (!motion) {
      throw new NotFoundException(`Motion #${id} not found`);
    }

    if (dto.inventoryId) {
      const inv = await this.inventoryRepo.findOne({ where: { id: dto.inventoryId } });
      if (!inv) throw new NotFoundException(`Inventory #${dto.inventoryId} not found`);
      motion.inventory = inv;
    }

    return this.motionRepo.save(motion);
  }

  async remove(id: number): Promise<void> {
    const result = await this.motionRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Motion #${id} not found`);
    }
  }
}
