import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MotionService } from './motion.service';
import { Motion } from './entities/motion.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Type } from './enumeration/type.enumeration';

describe('MotionService', () => {
  let service: MotionService;
  let motionRepo: jest.Mocked<Repository<Motion>>;
  let inventoryRepo: jest.Mocked<Repository<Inventory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotionService,
        {
          provide: getRepositoryToken(Motion),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Inventory),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MotionService>(MotionService);
    motionRepo = module.get(getRepositoryToken(Motion));
    inventoryRepo = module.get(getRepositoryToken(Inventory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a motion', async () => {
    const dto: CreateMotionDto = {
      date: new Date().toISOString(),
      type: Type.IN,
      amount: 10,
      inventoryId: 1,
    };

    const inventory = { id: 1 } as Inventory;
    const motion = {
      id: 1,
      date: new Date(dto.date),
      type: dto.type,
      amount: dto.amount,
      inventory,
    } as Motion;

    inventoryRepo.findOne.mockResolvedValue(inventory);
    motionRepo.create.mockReturnValue(motion);
    motionRepo.save.mockResolvedValue(motion);

    const result = await service.create(dto);
    expect(result).toEqual(motion);
    expect(motionRepo.create).toHaveBeenCalledWith({
      date: expect.any(Date),
      type: dto.type,
      amount: dto.amount,
      inventory,
    });
  });

  it('should throw if inventory not found during create', async () => {
    const dto: CreateMotionDto = {
      date: new Date().toISOString(),
      type: Type.OUT,
      amount: 5,
      inventoryId: 99,
    };
    inventoryRepo.findOne.mockResolvedValue(null);
    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('should return all motions', async () => {
    const data = [{ id: 1 }] as Motion[];
    motionRepo.find.mockResolvedValue(data);
    const result = await service.findAll();
    expect(result).toEqual(data);
  });

  it('should return one motion by id', async () => {
    const motion = { id: 1 } as Motion;
    motionRepo.findOne.mockResolvedValue(motion);
    const result = await service.findOne(1);
    expect(result).toEqual(motion);
  });

  it('should throw if motion not found by id', async () => {
    motionRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update a motion', async () => {
    const dto: UpdateMotionDto = {
      amount: 20,
      inventoryId: 1,
    };
    const inventory = { id: 1 } as Inventory;
    const motion = {
      id: 1,
      amount: dto.amount,
      type: Type.IN,
      date: dto.date ? new Date(dto.date) : undefined,
      inventory,
    } as unknown as Motion;

    motionRepo.preload.mockResolvedValue(motion);
    inventoryRepo.findOne.mockResolvedValue(inventory);
    motionRepo.save.mockResolvedValue(motion);

    const result = await service.update(1, dto);
    expect(result).toEqual(motion);
    expect(motionRepo.save).toHaveBeenCalledWith(motion);
  });

  it('should throw if motion not found in update', async () => {
    motionRepo.preload.mockResolvedValue(undefined);
    await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
  });

  it('should delete a motion', async () => {
    motionRepo.delete.mockResolvedValue({ affected: 1, raw: {} });
    await expect(service.remove(1)).resolves.toBeUndefined();
  });

  it('should throw if motion not found during delete', async () => {
    motionRepo.delete.mockResolvedValue({ affected: 0, raw: {} });
    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
