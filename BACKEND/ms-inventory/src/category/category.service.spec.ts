import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: jest.Mocked<any>;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repo = module.get(getRepositoryToken(Category));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const dto = { name: 'Lácteos' };
    const saved = { id: 1, ...dto };

    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue(saved);

    const result = await service.create(dto);
    expect(result).toEqual(saved);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('should return all categories', async () => {
    const categories = [{ id: 1, name: 'Bebidas' }];
    repo.find.mockResolvedValue(categories);

    const result = await service.findAll();
    expect(result).toEqual(categories);
    expect(repo.find).toHaveBeenCalledWith({ relations: ['products'] });
  });

  it('should return a category by id', async () => {
    const category = { id: 1, name: 'Snacks' };
    repo.findOne.mockResolvedValue(category);

    const result = await service.findOne(1);
    expect(result).toEqual(category);
  });

  it('should throw if category not found', async () => {
    repo.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(99)).rejects.toThrow(
      new NotFoundException('Category with ID 99 not found')
    );
  });

  it('should update a category', async () => {
    const existing = { id: 1, name: 'Viejo' };
    const dto = { name: 'Nuevo' };
    const updated = { ...existing, ...dto };

    repo.findOne.mockResolvedValue(existing);
    repo.save.mockResolvedValue(updated);

    const result = await service.update(1, dto);
    expect(result).toEqual(updated);
  });

  it('should delete a category', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw if trying to delete non-existent category', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(42)).rejects.toThrow(
      new NotFoundException('Category with ID 42 not found')
    );
  });

  it('should find category by name', async () => {
    const cat = { id: 1, name: 'Congelados' };
    repo.findOne.mockResolvedValue(cat);

    const result = await service.findOneByName('Congelados');
    expect(result).toEqual(cat);
  });

  it('should return null if category name not found', async () => {
    repo.findOne.mockResolvedValue(undefined);

    const result = await service.findOneByName('NoExiste');
    expect(result).toBeNull();
  });

  it('should return existing category in findByNameOrCreate', async () => {
    const cat = { id: 1, name: 'Frutas' };
    repo.findOne.mockResolvedValue(cat);

    const result = await service.findByNameOrCreate('Frutas');
    expect(result).toEqual(cat);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('should create new category if not found in findByNameOrCreate', async () => {
    const cat = { name: 'Verduras' };
    const saved = { id: 2, name: 'Verduras' };

    repo.findOne.mockResolvedValue(undefined);
    repo.create.mockReturnValue(cat);
    repo.save.mockResolvedValue(saved);

    const result = await service.findByNameOrCreate('Verduras');
    expect(result).toEqual(saved);
  });
});
