import { Test, TestingModule } from '@nestjs/testing';
import { ProvisionController } from './provision.controller';
import { ProvisionService } from './provision.service';
import { Provision } from './entities/provision.entity';
import { Supplier } from '../supplier/entities/supplier.entity';
import { Product } from '../product/entities/product.entity';

describe('ProvisionController', () => {
  let controller: ProvisionController;
  let service: ProvisionService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    findSuppliersByProduct: jest.fn(),
    findProductsBySupplier: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvisionController],
      providers: [
        {
          provide: ProvisionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProvisionController>(ProvisionController);
    service = module.get<ProvisionService>(ProvisionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a provision', async () => {
    const provision: Provision = { id: 1 } as Provision;
    mockService.create.mockResolvedValue(provision);
    const result = await controller.create(1, 2);
    expect(result).toEqual(provision);
    expect(service.create).toHaveBeenCalledWith(1, 2);
  });

  it('should return all provisions', async () => {
    const provisions = [{ id: 1 }] as Provision[];
    mockService.findAll.mockResolvedValue(provisions);
    const result = await controller.findAll();
    expect(result).toEqual(provisions);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one provision by id', async () => {
    const provision = { id: 1 } as Provision;
    mockService.findOne.mockResolvedValue(provision);
    const result = await controller.findOne(1);
    expect(result).toEqual(provision);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should delete a provision', async () => {
    mockService.remove.mockResolvedValue(undefined);
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should return suppliers by product', async () => {
    const suppliers = [{ id: 1, name: 'Supplier A' }] as Supplier[];
    mockService.findSuppliersByProduct.mockResolvedValue(suppliers);
    const result = await controller.findSuppliersByProduct(1);
    expect(result).toEqual(suppliers);
    expect(service.findSuppliersByProduct).toHaveBeenCalledWith(1);
  });

  it('should return products by supplier', async () => {
    const products = [{ id: 1, name: 'Product A' }] as Product[];
    mockService.findProductsBySupplier.mockResolvedValue(products);
    const result = await controller.findProductsBySupplier(1);
    expect(result).toEqual(products);
    expect(service.findProductsBySupplier).toHaveBeenCalledWith(1);
  });
});
