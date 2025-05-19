import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct dto and categoryId', async () => {
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
    const result = { id: 1, ...dto };
    mockProductService.create.mockResolvedValue(result);

    expect(await controller.create(1, dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(1, dto);
  });

  it('should return all products', async () => {
    const result = [{ id: 1, name: 'Product A' }];
    mockProductService.findAll.mockResolvedValue(result);

    expect(await controller.findAll()).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a product by id', async () => {
    const result = { id: 1, name: 'Product A' };
    mockProductService.findOne.mockResolvedValue(result);

    expect(await controller.findOne(1)).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a product', async () => {
    const dto: UpdateProductDto = { name: 'Updated Product' };
    const result = { id: 1, ...dto };
    mockProductService.update.mockResolvedValue(result);

    expect(await controller.update(1, dto)).toEqual(result);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a product', async () => {
    mockProductService.remove.mockResolvedValue(undefined);

    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
