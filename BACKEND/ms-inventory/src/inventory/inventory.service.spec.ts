import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Store } from '../store/entities/store.entity';
import { Product } from '../product/entities/product.entity';
import { Motion } from '../motion/entities/motion.entity';
import { Repository } from 'typeorm';
import { Type } from '../motion/enumeration/type.enumeration';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let invRepo: jest.Mocked<Repository<Inventory>>;
  let storeRepo: jest.Mocked<Repository<Store>>;
  let prodRepo: jest.Mocked<Repository<Product>>;
  let motionRepo: jest.Mocked<Repository<Motion>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Inventory), useValue: createMockRepo() },
        { provide: getRepositoryToken(Store), useValue: createMockRepo() },
        { provide: getRepositoryToken(Product), useValue: createMockRepo() },
        { provide: getRepositoryToken(Motion), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    invRepo = module.get(getRepositoryToken(Inventory));
    storeRepo = module.get(getRepositoryToken(Store));
    prodRepo = module.get(getRepositoryToken(Product));
    motionRepo = module.get(getRepositoryToken(Motion));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an inventory record', async () => {
    const store = { id: 1 } as Store;
    const product = { id: 2, stock: 50 } as Product;
    const savedInv = { id: 1, store, product, motions: [] } as Inventory;

    storeRepo.findOne.mockResolvedValue(store);
    prodRepo.findOne.mockResolvedValue(product);
    invRepo.findOne.mockResolvedValue(null);
    invRepo.create.mockReturnValue(savedInv);
    invRepo.save.mockResolvedValue(savedInv);
    motionRepo.create.mockReturnValue({} as Motion);
    motionRepo.save.mockResolvedValue({} as Motion);

    const result = await service.create(1, 2);
    expect(result).toEqual(savedInv);
  });

  it('should throw if inventory already exists', async () => {
    const store = { id: 1 } as Store;
    const product = { id: 2, stock: 50 } as Product;

    storeRepo.findOne.mockResolvedValue(store);
    prodRepo.findOne.mockResolvedValue(product);
    invRepo.findOne.mockResolvedValue({ id: 10 } as Inventory);

    await expect(service.create(1, 2)).rejects.toThrow(BadRequestException);
  });

  it('should return all inventories', async () => {
    const data = [{
      id: 1,
      store: {
        id: 1,
        code: 'A1',
        name: 'Store A',
        address: 'Address A',
        postalCode: '12345',
        longitude: 0,
        latitude: 0,
        capacity: 100,
        state: 'active',
        user: {} as any,
        city: {} as any,
        products: [],
        inventorys: [],
      },
      product: {
        id: 1,
        name: 'Product A',
        description: 'Desc',
        sku: 'SKU123',
        barcode: 'BAR123',
        unitPrice: 10,
        stock: 50,
        levelReorder: 10,
        dateEntry: new Date(),
        expirationDate: new Date(),
        weightKg: 1,
        lengthCm: 10,
        widthCm: 5,
        heightCm: 3,
        isFragile: false,
        requiresRefurbishment: false,
        status: 'active',
        category: {} as any,
        provision: [],
        inventorys: [],
      },
      motions: [],
    }] as unknown as Inventory[];

    invRepo.find.mockResolvedValue(data);

    const result = await service.findAll();
    expect(result).toEqual(data);
  });



  it('should throw if inventory not found', async () => {
    invRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should delete inventory', async () => {
    invRepo.findOne.mockResolvedValue({ id: 1 } as Inventory);
    invRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove(1)).resolves.toBeUndefined();
  });
});

// Helper to create a generic mocked repository
function createMockRepo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<Repository<any>>;
}
