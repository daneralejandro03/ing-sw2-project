import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

describe('CityController', () => {
  let controller: CityController;
  let service: CityService;

  const mockCityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByDepartament: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        { provide: CityService, useValue: mockCityService },
      ],
    }).compile();

    controller = module.get<CityController>(CityController);
    service = module.get<CityService>(CityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a city with departament id', async () => {
    const dto: CreateCityDto = { name: 'Manizales' };
    const result = { id: 1, name: 'Manizales' };

    mockCityService.create.mockResolvedValue(result);
    const response = await controller.create('10', dto);

    expect(response).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(10, dto);
  });

  it('should return all cities', async () => {
    const result = [{ id: 1, name: 'Cali' }];
    mockCityService.findAll.mockResolvedValue(result);

    const response = await controller.findAll();
    expect(response).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return one city by id', async () => {
    const result = { id: 1, name: 'Bogotá' };
    mockCityService.findOne.mockResolvedValue(result);

    const response = await controller.findOne('1');
    expect(response).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a city', async () => {
    const dto: UpdateCityDto = { name: 'Popayán' };
    const result = { id: 1, name: 'Popayán' };

    mockCityService.update.mockResolvedValue(result);
    const response = await controller.update('1', dto);

    expect(response).toEqual(result);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a city by id', async () => {
    const result = { deleted: true };
    mockCityService.remove.mockResolvedValue(result);

    const response = await controller.remove('1');
    expect(response).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('should find cities by departament id', async () => {
    const result = [{ id: 1, name: 'Neiva' }];
    mockCityService.findByDepartament.mockResolvedValue(result);

    const response = await controller.findByDepartament('2');
    expect(response).toEqual(result);
    expect(service.findByDepartament).toHaveBeenCalledWith(2);
  });
});
