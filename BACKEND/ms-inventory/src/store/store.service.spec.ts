import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { City } from '../city/entities/city.entity';
import { UserClientService } from '../user-client/user-client.service';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('StoreService', () => {
  let service: StoreService;
  let storeRepo: jest.Mocked<Repository<Store>>;
  let cityRepo: jest.Mocked<Repository<City>>;
  let userClient: jest.Mocked<UserClientService>;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    const mockManager = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockManager as any,
    } as unknown as jest.Mocked<QueryRunner>;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<DataSource>;

    storeRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Store>>;

    cityRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<City>>;

    userClient = {
      verifyUserExists: jest.fn(),
      addStoreToUser: jest.fn(),
      removeStoreFromUser: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserClientService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getRepositoryToken(Store), useValue: storeRepo },
        { provide: getRepositoryToken(City), useValue: cityRepo },
        { provide: UserClientService, useValue: userClient },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      name: 'Store1',
      code: 'S001',
      address: '123 St',
      postalCode: '11111',
      longitude: 0,
      latitude: 0,
      capacity: 10,
      state: 'active',
    };

    it('should throw if capacity <= 0', async () => {
      await expect(
        service.create(1, 'user1', { ...dto, capacity: 0 }, 'token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if city not found', async () => {
      cityRepo.findOne.mockResolvedValue(null);
      await expect(service.create(1, 'user1', dto, 'token')).rejects.toThrow(NotFoundException);
    });

    it('should create store successfully', async () => {
      const mockCity = { id: 1, name: 'Test City' } as City;
      const createdStore = { id: 1, ...dto, city: mockCity, userId: 'user1' };

      cityRepo.findOne.mockResolvedValue(mockCity);
      userClient.verifyUserExists.mockResolvedValue(undefined);
      (queryRunner.manager.create as jest.Mock).mockReturnValue(createdStore);
      (queryRunner.manager.save as jest.Mock).mockResolvedValue(createdStore);
      userClient.addStoreToUser.mockResolvedValue(undefined);

      const result = await service.create(1, 'user1', dto, 'token');

      expect(cityRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(userClient.verifyUserExists).toHaveBeenCalledWith('user1', 'token');
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.create).toHaveBeenCalledWith(Store, {
        ...dto,
        city: mockCity,
        userId: 'user1',
      });
      expect(queryRunner.manager.save).toHaveBeenCalledWith(createdStore);
      expect(userClient.addStoreToUser).toHaveBeenCalledWith('user1', 1, 'token');
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(createdStore);
    });

    it('should rollback transaction and throw on error', async () => {
      cityRepo.findOne.mockResolvedValue({ id: 1 } as City);
      userClient.verifyUserExists.mockResolvedValue(undefined);
      (queryRunner.manager.create as jest.Mock).mockReturnValue(dto as any);
      (queryRunner.manager.save as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.create(1, 'user1', dto, 'token')).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      const stores = [{ id: 1 }, { id: 2 }];
      storeRepo.find.mockResolvedValue(stores as any);
      const result = await service.findAll();
      expect(storeRepo.find).toHaveBeenCalledWith({ relations: ['city', 'inventory'] });
      expect(result).toEqual(stores);
    });
  });

  describe('findOne', () => {
    it('should throw if store not found', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should return store if found', async () => {
      const store = { id: 1 };
      storeRepo.findOne.mockResolvedValue(store as any);
      const result = await service.findOne(1);
      expect(result).toEqual(store);
    });
  });

  describe('findByCode', () => {
    it('should return null if not found', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      const result = await service.findByCode('code');
      expect(result).toBeNull();
    });

    it('should return store if found', async () => {
      const store = { id: 1 };
      storeRepo.findOne.mockResolvedValue(store as any);
      const result = await service.findByCode('code');
      expect(result).toEqual(store);
    });
  });

  describe('update', () => {
    const dto = { name: 'New Name' };

    it('should throw if store not found', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
    });

    it('should update and save store', async () => {
      const store = { id: 1, name: 'Old Name' };
      const updatedStore = { id: 1, name: 'New Name' };
      storeRepo.findOne.mockResolvedValue(store as any);
      storeRepo.save.mockResolvedValue(updatedStore as any);

      const result = await service.update(1, dto);
      expect(storeRepo.save).toHaveBeenCalledWith(store);
      expect(result).toEqual(updatedStore);
      expect(store.name).toEqual('New Name');
    });

    it('should throw InternalServerErrorException on save error', async () => {
      const store = { id: 1, name: 'Old Name' };
      storeRepo.findOne.mockResolvedValue(store as any);
      storeRepo.save.mockRejectedValue(new Error('fail'));

      await expect(service.update(1, dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if store not found', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(1, 'token')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if store has inventory', async () => {
      const store = { id: 1, inventory: [{}] };
      storeRepo.findOne.mockResolvedValue(store as any);
      await expect(service.remove(1, 'token')).rejects.toThrow(BadRequestException);
    });

    it('should remove store successfully', async () => {
      const store = { id: 1, inventory: [], userId: 'user1' };
      storeRepo.findOne.mockResolvedValue(store as any);
      (queryRunner.manager.delete as jest.Mock).mockResolvedValue({ affected: 1 });
      userClient.removeStoreFromUser.mockResolvedValue(undefined);

      await service.remove(1, 'token');

      expect(userClient.removeStoreFromUser).toHaveBeenCalledWith('user1', 1, 'token');
      expect(queryRunner.manager.delete).toHaveBeenCalledWith(Store, 1);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should rollback and throw InternalServerErrorException on error', async () => {
      const store = { id: 1, inventory: [], userId: 'user1' };
      storeRepo.findOne.mockResolvedValue(store as any);
      (queryRunner.manager.delete as jest.Mock).mockRejectedValue(new Error('fail'));
      userClient.removeStoreFromUser.mockResolvedValue(undefined);

      await expect(service.remove(1, 'token')).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findByNameOne', () => {
    it('should return null if not found', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      const result = await service.findByNameOne('storeName');
      expect(result).toBeNull();
    });

    it('should return store if found', async () => {
      const store = { id: 1 };
      storeRepo.findOne.mockResolvedValue(store as any);
      const result = await service.findByNameOne('storeName');
      expect(result).toEqual(store);
    });
  });

  describe('findAllUsers', () => {
    it('should return mapped users', async () => {
      const users = [
        { id: 'u1', email: 'e1', role: 'r1' },
        { id: 'u2', email: 'e2', role: 'r2' },
      ];
      userClient.findAll.mockResolvedValue(users);
      const result = await service.findAllUsers('token');
      expect(result).toEqual(users);
    });
  });
});
