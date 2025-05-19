import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentService } from './departament.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Departament } from './entities/departament.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateDepartamentDto } from './dto/create-departament.dto';
import { UpdateDepartamentDto } from './dto/update-departament.dto';

describe('DepartamentService', () => {
  let service: DepartamentService;
  let repo: jest.Mocked<Repository<Departament>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartamentService,
        {
          provide: getRepositoryToken(Departament),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DepartamentService>(DepartamentService);
    repo = module.get(getRepositoryToken(Departament));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a departament', async () => {
    const dto: CreateDepartamentDto = { name: 'Cundinamarca' };
    const entity = { id: 1, name: 'Cundinamarca', citys: [] };

    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);

    const result = await service.create(dto);
    expect(result).toEqual(entity);
    expect(repo.create).toHaveBeenCalledWith({ name: dto.name });
    expect(repo.save).toHaveBeenCalledWith(entity);
  });

  it('should return all departaments', async () => {
    const deps = [{ id: 1, name: 'Tolima', citys: [] }];
    repo.find.mockResolvedValue(deps);

    const result = await service.findAll();
    expect(result).toEqual(deps);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should return one departament by id', async () => {
    const dep = { id: 1, name: 'Valle', citys: [] };
    repo.findOne.mockResolvedValue(dep);

    const result = await service.findOne(1);
    expect(result).toEqual(dep);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw if departament not found by id', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(
      new NotFoundException('Departament #99 not found'),
    );
  });

  it('should update a departament', async () => {
    const original = { id: 1, name: 'Old', citys: [] };
    const updated = { id: 1, name: 'New', citys: [] };
    repo.findOne.mockResolvedValue(original);
    repo.save.mockResolvedValue(updated);

    const dto: UpdateDepartamentDto = { name: 'New' };
    const result = await service.update(1, dto);
    expect(result).toEqual(updated);
    expect(repo.save).toHaveBeenCalledWith({ id: 1, name: 'New', citys: [] });
  });

  it('should throw when updating non-existent departament', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.update(2, { name: 'X' })).rejects.toThrow(
      new NotFoundException('Departament #2 not found'),
    );
  });

  it('should delete a departament', async () => {
    repo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if departament not found during delete', async () => {
    repo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(88)).rejects.toThrow(
      new NotFoundException('Departament #88 not found'),
    );
  });

  it('should return existing departament in findByNameOrCreate', async () => {
    const existing = { id: 1, name: 'Nariño', citys: [] };
    repo.findOne.mockResolvedValue(existing);

    const result = await service.findByNameOrCreate('Nariño');
    expect(result).toEqual(existing);
  });

  it('should create departament if not found in findByNameOrCreate', async () => {
    const created = { id: 2, name: 'Amazonas', citys: [] };
    repo.findOne.mockResolvedValue(null);
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await service.findByNameOrCreate('Amazonas');
    expect(result).toEqual(created);
    expect(repo.create).toHaveBeenCalledWith({ name: 'Amazonas' });
    expect(repo.save).toHaveBeenCalledWith(created);
  });
});
