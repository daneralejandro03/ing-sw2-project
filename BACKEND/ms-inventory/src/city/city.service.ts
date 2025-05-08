import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { Departament } from '../departament/entities/departament.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,

    @InjectRepository(Departament)
    private readonly departamentRepo: Repository<Departament>,
  ) { }

  async create(dto: CreateCityDto): Promise<City> {

    const dept = await this.departamentRepo.findOne({ where: { id: dto.departamentId } });
    if (!dept) throw new NotFoundException(`Departament #${dto.departamentId} not found`);

    const city = this.cityRepo.create({
      name: dto.name,
      departament: dept,
    });
    return this.cityRepo.save(city);
  }

  findAll(): Promise<City[]> {
    return this.cityRepo.find({ relations: ['departament'] });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepo.findOne({
      where: { id },
      relations: ['departament'],
    });
    if (!city) throw new NotFoundException(`City #${id} not found`);
    return city;
  }

  async update(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);

    if (dto.name !== undefined) {
      city.name = dto.name;
    }
    if (dto.departamentId !== undefined) {
      const dept = await this.departamentRepo.findOne({ where: { id: dto.departamentId } });
      if (!dept) throw new NotFoundException(`Departament #${dto.departamentId} not found`);
      city.departament = dept;
    }

    return this.cityRepo.save(city);
  }

  async remove(id: number): Promise<void> {
    const result = await this.cityRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`City #${id} not found`);
    }
  }

  async findByDepartament(departamentId: number): Promise<City[]> {
    return this.cityRepo.find({
      where: { departament: { id: departamentId } }
    });
  }
}
