import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentController } from './departament.controller';
import { DepartamentService } from './departament.service';
import { CreateDepartamentDto } from './dto/create-departament.dto';
import { UpdateDepartamentDto } from './dto/update-departament.dto';

describe('DepartamentController', () => {
  let controller: DepartamentController;
  let service: DepartamentService;

  const mockDepartamentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartamentController],
      providers: [
        { provide: DepartamentService, useValue: mockDepartamentService },
      ],
    }).compile();

    controller = module.get<DepartamentController>(DepartamentController);
    service = module.get<DepartamentService>(DepartamentService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a departament', async () => {
    const dto: CreateDepartamentDto = { name: 'Caldas' };
    const result = { id: 1, ...dto };

    mockDepartamentService.create.mockResolvedValue(result);

    const response = await controller.create(dto);
    expect(response).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should return all departaments', async () => {
    const result = [{ id: 1, name: 'Antioquia' }];
    mockDepartamentService.findAll.mockResolvedValue(result);

    const response = await controller.findAll();
    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a departament by id', async () => {
    const result = { id: 1, name: 'Tolima' };
    mockDepartamentService.findOne.mockResolvedValue(result);

    const response = await controller.findOne('1');
    expect(response).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a departament', async () => {
    const dto: UpdateDepartamentDto = { name: 'Updated' };
    const result = { id: 1, name: 'Updated' };

    mockDepartamentService.update.mockResolvedValue(result);

    const response = await controller.update('1', dto);
    expect(response).toEqual(result);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a departament', async () => {
    const result = { deleted: true };
    mockDepartamentService.remove.mockResolvedValue(result);

    const response = await controller.remove('1');
    expect(response).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
