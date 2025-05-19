import { Test, TestingModule } from '@nestjs/testing';
import { ProvisionService } from './provision.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provision } from './entities/provision.entity';
import { Product } from '../product/entities/product.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('ProvisionService', () => {
  let service: ProvisionService;
  let provRepo: jest.Mocked<Repository<Provision>>;
  let prodRepo: jest.Mocked<Repository<Product>>;
  let suppRepo: jest.Mocked<Repository<Supplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvisionService,
        {
          provide: getRepositoryToken(Provision),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Supplier),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProvisionService>(ProvisionService);
    provRepo = module.get(getRepositoryToken(Provision));
    prodRepo = module.get(getRepositoryToken(Product));
    suppRepo = module.get(getRepositoryToken(Supplier));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a provision', async () => {
    const product = { id: 1 } as Product;
    const supplier = { id: 2 } as Supplier;
    const provision = { id: 3, product, supplier } as Provision;

    prodRepo.findOne.mockResolvedValue(product);
    suppRepo.findOne.mockResolvedValue(supplier);
    provRepo.findOne.mockResolvedValue(null);
    provRepo.create.mockReturnValue(provision);
    provRepo.save.mockResolvedValue(provision);

    const result = await service.create(1, 2);
    expect(result).toEqual(provision);
  });

  it('should throw if product not found in create', async () => {
    prodRepo.findOne.mockResolvedValue(null);
    await expect(service.create(1, 2)).rejects.toThrow(NotFoundException);
  });

  it('should throw if supplier not found in create', async () => {
    prodRepo.findOne.mockResolvedValue({ id: 1 } as Product);
    suppRepo.findOne.mockResolvedValue(null);
    await expect(service.create(1, 2)).rejects.toThrow(NotFoundException);
  });

  it('should throw if provision already exists', async () => {
    prodRepo.findOne.mockResolvedValue({ id: 1 } as Product);
    suppRepo.findOne.mockResolvedValue({ id: 2 } as Supplier);
    provRepo.findOne.mockResolvedValue({} as Provision);
    await expect(service.create(1, 2)).rejects.toThrow(BadRequestException);
  });

  it('should return all provisions', async () => {
    const provs = [{ id: 1 }] as Provision[];
    provRepo.find.mockResolvedValue(provs);
    const result = await service.findAll();
    expect(result).toEqual(provs);
  });

  it('should find one provision', async () => {
    const prov = { id: 1 } as Provision;
    provRepo.findOne.mockResolvedValue(prov);
    const result = await service.findOne(1);
    expect(result).toEqual(prov);
  });

  it('should throw if provision not found', async () => {
    provRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should remove a provision', async () => {
    provRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('should throw if remove fails', async () => {
    provRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should return suppliers by product', async () => {
    prodRepo.findOne.mockResolvedValue({ id: 1 } as Product);
    provRepo.find.mockResolvedValue([
      { supplier: { id: 1 } as Supplier } as Provision,
    ]);
    const result = await service.findSuppliersByProduct(1);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should return products by supplier', async () => {
    suppRepo.findOne.mockResolvedValue({ id: 1 } as Supplier);
    provRepo.find.mockResolvedValue([
      { product: { id: 1 } as Product } as Provision,
    ]);
    const result = await service.findProductsBySupplier(1);
    expect(result).toEqual([{ id: 1 }]);
  });
});
