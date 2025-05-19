import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { Product } from '../product/entities/product.entity';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: jest.Mocked<InventoryService>;

  beforeEach(async () => {
    const mockInventoryService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      findProductsByStore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        { provide: InventoryService, useValue: mockInventoryService },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an inventory record', async () => {
    const mockInventory: Inventory = { id: 1, store: {} as any, product: {} as any, motions: [] };
    service.create.mockResolvedValue(mockInventory);

    const result = await controller.create(1, 2);
    expect(result).toEqual(mockInventory);
    expect(service.create).toHaveBeenCalledWith(1, 2);
  });

  it('should return all inventory records', async () => {
    const mockList = [{ id: 1 }, { id: 2 }] as Inventory[];
    service.findAll.mockResolvedValue(mockList);

    const result = await controller.findAll();
    expect(result).toEqual(mockList);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one inventory record by id', async () => {
    const mockInventory = { id: 1 } as Inventory;
    service.findOne.mockResolvedValue(mockInventory);

    const result = await controller.findOne('1');
    expect(result).toEqual(mockInventory);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should delete an inventory record by id', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove('1');
    expect(result).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should return products by storeId', async () => {
    const mockProducts = [{ id: 10 }, { id: 20 }] as Product[];
    service.findProductsByStore.mockResolvedValue(mockProducts);

    const result = await controller.findByStore(3);
    expect(result).toEqual(mockProducts);
    expect(service.findProductsByStore).toHaveBeenCalledWith(3);
  });
});
