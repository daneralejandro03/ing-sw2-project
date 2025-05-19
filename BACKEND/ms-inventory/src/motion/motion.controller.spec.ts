import { Test, TestingModule } from '@nestjs/testing';
import { MotionController } from './motion.controller';
import { MotionService } from './motion.service';
import { CreateMotionDto } from './dto/create-motion.dto';
import { UpdateMotionDto } from './dto/update-motion.dto';
import { Type } from './enumeration/type.enumeration';


describe('MotionController', () => {
  let controller: MotionController;
  let service: MotionService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotionController],
      providers: [{ provide: MotionService, useValue: mockService }],
    }).compile();

    controller = module.get<MotionController>(MotionController);
    service = module.get<MotionService>(MotionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with dto', async () => {
    const dto: CreateMotionDto = {
      date: new Date().toISOString(),
      type: Type.IN,
      amount: 5,
      inventoryId: 1,
    };
    const expectedResult = { id: 1, ...dto };
    mockService.create.mockResolvedValue(expectedResult);

    const result = await controller.create(dto);
    expect(result).toEqual(expectedResult);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all motions', async () => {
    const motions = [{ id: 1 }, { id: 2 }];
    mockService.findAll.mockResolvedValue(motions);

    const result = await controller.findAll();
    expect(result).toEqual(motions);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a motion by ID', async () => {
    const motion = { id: 1 };
    mockService.findOne.mockResolvedValue(motion);

    const result = await controller.findOne('1');
    expect(result).toEqual(motion);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a motion', async () => {
    const dto: UpdateMotionDto = { amount: 10 };
    const updated = { id: 1, amount: 10 };
    mockService.update.mockResolvedValue(updated);

    const result = await controller.update('1', dto);
    expect(result).toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should delete a motion', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await expect(controller.remove('1')).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
