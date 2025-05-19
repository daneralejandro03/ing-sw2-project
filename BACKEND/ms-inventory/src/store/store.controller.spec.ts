import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('StoreController', () => {
  let controller: StoreController;
  let service: jest.Mocked<StoreService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllUsers: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      // Mockear JwtAuthGuard para que solo retorne true en canActivate
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<StoreController>(StoreController);
    service = module.get(StoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      code: '001',
      name: 'Test Store',
      address: '123 Street',
      postalCode: '12345',
      longitude: 10,
      latitude: 20,
      capacity: 100,
      state: 'active',
    };
    const mockStore = { id: 1, ...dto };

    it('should throw if token missing or invalid', async () => {
      await expect(
        () => controller.create(1, 'user123', dto, { headers: {} } as any),
      ).toThrow(BadRequestException);

      await expect(
        () =>
          controller.create(1, 'user123', dto, {
            headers: { authorization: 'InvalidToken' },
          } as any),
      ).toThrow(BadRequestException);
    });

    it('should call service.create with correct params', async () => {
      service.create.mockResolvedValue(mockStore as any);
      const req = { headers: { authorization: 'Bearer validtoken' } } as any;

      const result = await controller.create(1, 'user123', dto, req);

      expect(service.create).toHaveBeenCalledWith(1, 'user123', dto, 'Bearer validtoken');
      expect(result).toEqual(mockStore);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const stores = [{ id: 1 }, { id: 2 }];
      service.findAll.mockResolvedValue(stores as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(stores);
    });
  });

  describe('findAllUsers', () => {
    it('should throw if token missing or invalid', async () => {
      await expect(() => controller.findAllUsers({ headers: {} } as any)).toThrow('Token no provisto');
      await expect(() =>
        controller.findAllUsers({ headers: { authorization: 'InvalidToken' } } as any),
      ).toThrow('Token no provisto');
    });

    it('should call service.findAllUsers with token', async () => {
      const users = [{ id: 'u1' }, { id: 'u2' }];
      service.findAllUsers.mockResolvedValue(users as any);
      const req = { headers: { authorization: 'Bearer validtoken' } } as any;

      const result = await controller.findAllUsers(req);

      expect(service.findAllUsers).toHaveBeenCalledWith('Bearer validtoken');
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const store = { id: 1 };
      service.findOne.mockResolvedValue(store as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(store);
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto', async () => {
      const updated = { id: 1, name: 'Updated Store' };
      const dto = { name: 'Updated Store' };
      service.update.mockResolvedValue(updated as any);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should throw if token missing or invalid', async () => {
      await expect(() => controller.remove(1, { headers: {} } as any)).rejects.toThrow(BadRequestException);
      await expect(() =>
        controller.remove(1, { headers: { authorization: 'InvalidToken' } } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service.remove and return message', async () => {
      service.remove.mockResolvedValue();
      const req = { headers: { authorization: 'Bearer validtoken' } } as any;

      const result = await controller.remove(1, req);

      expect(service.remove).toHaveBeenCalledWith(1, 'validtoken');
      expect(result).toEqual({ message: 'Store #1 eliminada correctamente' });
    });
  });
});
