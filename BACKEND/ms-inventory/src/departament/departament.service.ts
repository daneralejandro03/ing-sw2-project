import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departament } from './entities/departament.entity';
import { CreateDepartamentDto } from './dto/create-departament.dto';
import { UpdateDepartamentDto } from './dto/update-departament.dto';

@Injectable()
export class DepartamentService {
  constructor(
    @InjectRepository(Departament)
    private readonly repo: Repository<Departament>,
  ) { }

  create(dto: CreateDepartamentDto): Promise<Departament> {
    const dep = this.repo.create({ name: dto.name });
    return this.repo.save(dep);
  }

  findAll(): Promise<Departament[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Departament> {
    const dep = await this.repo.findOne({ where: { id } });
    if (!dep) throw new NotFoundException(`Departament #${id} not found`);
    return dep;
  }

  async update(id: number, dto: UpdateDepartamentDto): Promise<Departament> {
    const dep = await this.findOne(id);
    if (dto.name !== undefined) dep.name = dto.name;
    return this.repo.save(dep);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Departament #${id} not found`);
    }
  }

  async findByNameOrCreate(name: string): Promise<Departament> {
    const dep = await this.repo.findOne({ where: { name } });
    if (dep) return dep;

    const newDep = this.repo.create({ name });
    return this.repo.save(newDep);
  }
}
