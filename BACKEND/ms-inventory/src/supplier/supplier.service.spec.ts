import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from './supplier.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

describe('SupplierService', () => {
  let service: SupplierService;
  let repo: jest.Mocked<Repository<Supplier>>;

  const mockSupplier: Supplier = {
    id: 1,
    name: 'Supplier 1',
    provision: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: getRepositoryToken(Supplier),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    repo = module.get(getRepositoryToken(Supplier));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if supplier exists', async () => {
      repo.findOne.mockResolvedValue(mockSupplier);
      await expect(service.create({ name: 'Supplier 1' })).rejects.toThrow(ConflictException);
    });

    it('should create and return supplier', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockSupplier);
      repo.save.mockResolvedValue(mockSupplier);

      const result = await service.create({ name: 'Supplier 1' });
      expect(repo.create).toHaveBeenCalledWith({ name: 'Supplier 1' });
      expect(repo.save).toHaveBeenCalledWith(mockSupplier);
      expect(result).toEqual(mockSupplier);
    });

    it('should throw InternalServerErrorException on save failure', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockSupplier);
      repo.save.mockRejectedValue(new Error('Save error'));

      await expect(service.create({ name: 'Supplier 1' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all suppliers with provisions', async () => {
      repo.find.mockResolvedValue([mockSupplier]);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({ relations: ['provision'] });
      expect(result).toEqual([mockSupplier]);
    });
  });

  describe('findOne', () => {
    it('should return supplier if found', async () => {
      repo.findOne.mockResolvedValue(mockSupplier);
      const result = await service.findOne(1);
      expect(result).toEqual(mockSupplier);
    });

    it('should throw NotFoundException if supplier not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return supplier', async () => {
      const updated = { ...mockSupplier, name: 'Updated' };
      repo.findOne.mockResolvedValue(mockSupplier);
      repo.save.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'Updated' });
      expect(result).toEqual(updated);
    });

    it('should throw InternalServerErrorException on save error', async () => {
      repo.findOne.mockResolvedValue(mockSupplier);
      repo.save.mockRejectedValue(new Error('Fail'));
      await expect(service.update(1, { name: 'Fail' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if supplier has provisions', async () => {
      repo.findOne.mockResolvedValue({ ...mockSupplier, provision: [{}] as any });
      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });

    it('should remove supplier successfully', async () => {
      repo.findOne.mockResolvedValue({ ...mockSupplier, provision: [] });
      repo.delete.mockResolvedValue({ affected: 1 , raw : {}});

      await expect(service.remove(1)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if delete fails', async () => {
      repo.findOne.mockResolvedValue({ ...mockSupplier, provision: [] });
      repo.delete.mockResolvedValue({ affected: 0 , raw : {}});

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByName', () => {
    it('should return supplier if found', async () => {
      repo.findOne.mockResolvedValue(mockSupplier);
      const result = await service.findOneByName('Supplier 1');
      expect(result).toEqual(mockSupplier);
    });

    it('should return null if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findOneByName('Not exists');
      expect(result).toBeNull();
    });
  });

  describe('findByNameOrCreate', () => {
    it('should return existing supplier', async () => {
      repo.findOne.mockResolvedValue(mockSupplier);
      const result = await service.findByNameOrCreate('Supplier 1');
      expect(result).toEqual(mockSupplier);
    });

    it('should create and return new supplier', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockSupplier);
      repo.save.mockResolvedValue(mockSupplier);

      const result = await service.findByNameOrCreate('New Supplier');
      expect(result).toEqual(mockSupplier);
    });
  });
});
