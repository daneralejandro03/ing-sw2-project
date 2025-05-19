import { Test, TestingModule } from '@nestjs/testing';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

describe('SupplierController', () => {
  let controller: SupplierController;
  let service: jest.Mocked<SupplierService>;

  const mockSupplier: Supplier = {
    id: 1,
    name: 'Supplier 1',
    provision: [],
  };

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<SupplierService>> = {
      create: jest.fn().mockResolvedValue(mockSupplier),
      findAll: jest.fn().mockResolvedValue([mockSupplier]),
      findOne: jest.fn().mockResolvedValue(mockSupplier),
      update: jest.fn().mockResolvedValue({ ...mockSupplier, name: 'Updated Supplier' }),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [{ provide: SupplierService, useValue: serviceMock }],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
    service = module.get(SupplierService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create and return the result', async () => {
      const dto: CreateSupplierDto = {
        name: 'Supplier 1',
      };

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSupplier);
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockSupplier]);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const result = await controller.findOne(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSupplier);
    });
  });

  describe('update', () => {
    it('should update a supplier and return the updated supplier', async () => {
      const dto: UpdateSupplierDto = { name: 'Updated Supplier' };
      const result = await controller.update(1, dto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ ...mockSupplier, name: 'Updated Supplier' });
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const result = await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
