import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepo: jest.Mocked<Repository<Product>>;
  let categoryRepo: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepo = module.get(getRepositoryToken(Product));
    categoryRepo = module.get(getRepositoryToken(Category));
  });

  const mockProduct = (extra: Partial<Product> = {}): Product => ({
    id: 1,
    name: 'Mock',
    description: 'Mock desc',
    sku: 'SKU001',
    barcode: '123',
    unitPrice: 10,
    stock: 100,
    levelReorder: 5,
    dateEntry: new Date(),
    expirationDate: new Date(),
    weightKg: 1,
    lengthCm: 10,
    widthCm: 10,
    heightCm: 10,
    isFragile: false,
    requiresRefurbishment: false,
    status: 'active',
    category: {} as any,
    inventory: [],
    provision: [],
    ...extra,
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', async () => {
    const dto: CreateProductDto = {
      name: 'Product A',
      description: 'Desc',
      sku: 'SKU123',
      barcode: '1234567890123',
      unitPrice: 10,
      stock: 50,
      levelReorder: 5,
      dateEntry: new Date(),
      expirationDate: new Date(),
      weightKg: 2,
      lengthCm: 10,
      widthCm: 5,
      heightCm: 4,
      isFragile: false,
      requiresRefurbishment: false,
      status: 'active',
    };

    const category = { id: 1 } as Category;
    const product = { id: 1, ...dto, category } as Product;

    categoryRepo.findOne.mockResolvedValue(category);
    productRepo.create.mockReturnValue(product);
    productRepo.save.mockResolvedValue(product);

    const result = await service.create(1, dto);
    expect(result).toEqual(product);
  });

  it('should throw if category not found on create', async () => {
    categoryRepo.findOne.mockResolvedValue(null);
    await expect(service.create(1, {} as CreateProductDto)).rejects.toThrow(NotFoundException);
  });

  it('should return all products', async () => {
    const products = [mockProduct()];
    productRepo.find.mockResolvedValue(products);
    const result = await service.findAll();
    expect(result).toEqual(products);
  });

  it('should return one product', async () => {
    const product = mockProduct();
    productRepo.findOne.mockResolvedValue(product);
    const result = await service.findOne(1);
    expect(result).toEqual(product);
  });

  it('should throw if product not found by id', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update a product', async () => {
    const existing = mockProduct({ name: 'Old' });
    const updated = { ...existing, name: 'New' };
    productRepo.findOne.mockResolvedValue(existing);
    productRepo.save.mockResolvedValue(updated);

    const dto: UpdateProductDto = { name: 'New' };
    const result = await service.update(1, dto);
    expect(result).toEqual(updated);
  });

  it('should remove a product if no inventory or provision', async () => {
    const product = mockProduct();
    productRepo.findOne.mockResolvedValue(product);
    productRepo.delete.mockResolvedValue({ affected: 1, raw: {} });

    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('should throw if product has inventory', async () => {
    const product = mockProduct({ inventory: [{} as any] });
    productRepo.findOne.mockResolvedValue(product);

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('should throw if product has provision', async () => {
    const product = mockProduct({ provision: [{} as any] });
    productRepo.findOne.mockResolvedValue(product);

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('should throw if product not found in delete', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw if product delete fails', async () => {
    const product = mockProduct();
    productRepo.findOne.mockResolvedValue(product);
    productRepo.delete.mockResolvedValue({ affected: 0, raw: {} });

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
