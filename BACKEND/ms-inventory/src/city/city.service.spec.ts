import { Test, TestingModule } from '@nestjs/testing';
import { CityService } from './city.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Departament } from '../departament/entities/departament.entity';
import { NotFoundException } from '@nestjs/common';

describe('CityService', () => {
  let service: CityService;
  let cityRepo: any;
  let deptRepo: any;

  const mockCityRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockDepartamentRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: getRepositoryToken(City),
          useValue: mockCityRepo,
        },
        {
          provide: getRepositoryToken(Departament),
          useValue: mockDepartamentRepo,
        },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
    cityRepo = module.get(getRepositoryToken(City));
    deptRepo = module.get(getRepositoryToken(Departament));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a city when departament exists', async () => {
    const dept = { id: 1, name: 'Caldas' };
    const dto = { name: 'Manizales' };
    const created = { id: 1, name: 'Manizales', departament: dept };

    deptRepo.findOne.mockResolvedValue(dept);
    cityRepo.create.mockReturnValue(created);
    cityRepo.save.mockResolvedValue(created);

    const result = await service.create(1, dto);
    expect(result).toEqual(created);
    expect(cityRepo.create).toHaveBeenCalledWith({ name: 'Manizales', departament: dept });
    expect(cityRepo.save).toHaveBeenCalledWith(created);
  });

  it('should throw if departament does not exist on create', async () => {
    deptRepo.findOne.mockResolvedValue(null);
    await expect(service.create(99, { name: 'Armenia' })).rejects.toThrow(
      new NotFoundException('Departament #99 not found'),
    );
  });

  it('should return all cities', async () => {
    const cities = [{ id: 1, name: 'Bogotá' }];
    cityRepo.find.mockResolvedValue(cities);

    const result = await service.findAll();
    expect(result).toEqual(cities);
    expect(cityRepo.find).toHaveBeenCalledWith({ relations: ['departament'] });
  });

  it('should return a city by id', async () => {
    const city = { id: 1, name: 'Medellín' };
    cityRepo.findOne.mockResolvedValue(city);

    const result = await service.findOne(1);
    expect(result).toEqual(city);
  });

  it('should throw if city not found by id', async () => {
    cityRepo.findOne.mockResolvedValue(undefined);
    await expect(service.findOne(999)).rejects.toThrow(
      new NotFoundException('City #999 not found')
    );
  });

  it('should update a city name', async () => {
    const city = { id: 1, name: 'Old Name' };
    const updated = { id: 1, name: 'New Name' };

    cityRepo.findOne.mockResolvedValue(city);
    cityRepo.save.mockResolvedValue(updated);

    const result = await service.update(1, { name: 'New Name' });
    expect(result).toEqual(updated);
  });

  it('should throw if updating non-existent city', async () => {
    cityRepo.findOne.mockResolvedValue(undefined);
    await expect(service.update(123, { name: 'Nada' })).rejects.toThrow(
      new NotFoundException('City #123 not found')
    );
  });

  it('should remove a city', async () => {
    cityRepo.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(cityRepo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if city not found to remove', async () => {
    cityRepo.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(1)).rejects.toThrow(
      new NotFoundException('City #1 not found')
    );
  });

  it('should find cities by departament', async () => {
    const cities = [{ id: 1, name: 'Tunja' }];
    cityRepo.find.mockResolvedValue(cities);

    const result = await service.findByDepartament(5);
    expect(result).toEqual(cities);
    expect(cityRepo.find).toHaveBeenCalledWith({
      where: { departament: { id: 5 } },
    });
  });

  it('should find one city by name', async () => {
    const city = { id: 1, name: 'Santa Marta' };
    cityRepo.findOne.mockResolvedValue(city);

    const result = await service.findOneCityName('Santa Marta');
    expect(result).toEqual(city);
  });

  it('should throw if city not found by name', async () => {
    cityRepo.findOne.mockResolvedValue(undefined);
    await expect(service.findOneCityName('NoExiste')).rejects.toThrow(
      new NotFoundException('City #NoExiste not found')
    );
  });

  it('should return city if found in findByNameOrCreate', async () => {
    const city = { id: 1, name: 'Leticia' };
    cityRepo.findOne.mockResolvedValue(city);

    const result = await service.findByNameOrCreate(1, 'Leticia');
    expect(result).toEqual(city);
  });

  it('should create new city if not found in findByNameOrCreate', async () => {
    const dept = { id: 10, name: 'Huila' };
    const created = { name: 'Garzón', departament: dept };
    const saved = { id: 99, ...created };

    cityRepo.findOne.mockResolvedValue(null);
    deptRepo.findOne.mockResolvedValue(dept);
    cityRepo.create.mockReturnValue(created);
    cityRepo.save.mockResolvedValue(saved);

    const result = await service.findByNameOrCreate(10, 'Garzón');
    expect(result).toEqual(saved);
  });

  it('should throw if departament not found in findByNameOrCreate', async () => {
    cityRepo.findOne.mockResolvedValue(null);
    deptRepo.findOne.mockResolvedValue(null);

    await expect(service.findByNameOrCreate(77, 'NoDep')).rejects.toThrow(
      new NotFoundException('Departament #77 not found')
    );
  });
});
