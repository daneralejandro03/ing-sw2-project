import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly suppRepo: Repository<Supplier>,
  ) { }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const exists = await this.suppRepo.findOne({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException(`Supplier con nombre "${dto.name}" ya existe`);
    }
    try {
      const supplier = this.suppRepo.create(dto);
      return await this.suppRepo.save(supplier);
    } catch (err) {
      throw new InternalServerErrorException(`Error creando supplier: ${err}`);
    }
  }

  findAll(): Promise<Supplier[]> {
    return this.suppRepo.find({ relations: ['provision'] });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.suppRepo.findOne({
      where: { id },
      relations: ['provision'],
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier #${id} no encontrado`);
    }
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    try {
      return await this.suppRepo.save(supplier);
    } catch (err) {
      throw new InternalServerErrorException(`Error actualizando supplier: ${err}`);
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.suppRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Supplier #${id} no encontrado`);
    }
  }
}
