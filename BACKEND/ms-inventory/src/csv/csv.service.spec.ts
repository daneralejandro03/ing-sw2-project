import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { DataSource } from 'typeorm';

import { UserClientService } from '../user-client/user-client.service';
import { RoleClientService } from '../role-client/role-client.service';
import { CityService } from '../city/city.service';
import { DepartamentService } from '../departament/departament.service';
import { StoreService } from '../store/store.service';
import { CategoryService } from '../category/category.service';
import { SupplierService } from '../supplier/supplier.service';
import { ProductService } from '../product/product.service';
import { ProvisionService } from '../provision/provision.service';
import { InventoryService } from '../inventory/inventory.service';

describe('CsvService', () => {
  let service: CsvService;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  const mockProviders = {
    userClient: {},
    roleClient: {},
    cityService: {},
    departService: {},
    storeService: {},
    categoryService: {},
    supplierService: {},
    productService: {},
    provisionService: {},
    inventoryService: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: UserClientService, useValue: mockProviders.userClient },
        { provide: RoleClientService, useValue: mockProviders.roleClient },
        { provide: CityService, useValue: mockProviders.cityService },
        { provide: DepartamentService, useValue: mockProviders.departService },
        { provide: StoreService, useValue: mockProviders.storeService },
        { provide: CategoryService, useValue: mockProviders.categoryService },
        { provide: SupplierService, useValue: mockProviders.supplierService },
        { provide: ProductService, useValue: mockProviders.productService },
        { provide: ProvisionService, useValue: mockProviders.provisionService },
        { provide: InventoryService, useValue: mockProviders.inventoryService },
      ],
    }).compile();

    service = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if CSV is malformed', async () => {
    const invalidBuffer = Buffer.from('DEPARTAMENTO,MUNICIPIO\nBogotá'); // Faltante
    await expect(service.uploadDepartamentsAndCitys(invalidBuffer)).rejects.toThrow();
  });
});
