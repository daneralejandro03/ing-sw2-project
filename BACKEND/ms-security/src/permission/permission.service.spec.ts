import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PermissionService', () => {
  let service: PermissionService;

  const mockPermissionModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    populate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockAccessModel = {
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
        {
          provide: getModelToken('Permission'),
          useValue: mockPermissionModel,
        },
        {
          provide: getModelToken('Access'),
          useValue: mockAccessModel,
        },
      ],
    }).compile();

    service = module.get<PermissionService>(PermissionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call create with correct dto', async () => {
    const dto = {
      name: 'CREATE_USER',
      url: '/user',
      method: 'POST',
      module: 'User',
      description: 'Crear usuarios',
    };
    const result = { id: '1', ...dto };
    mockPermissionModel.create.mockResolvedValue(result);

    const response = await service.create(dto);
    expect(response).toEqual(result);
    expect(mockPermissionModel.create).toHaveBeenCalledWith(dto);
  });

  it('should throw BadRequestException if permission has associated accesses', async () => {
    mockAccessModel.countDocuments.mockResolvedValue(2);

    await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    expect(mockAccessModel.countDocuments).toHaveBeenCalledWith({ permission: '1' });
  });

  it('should throw NotFoundException if permission to delete is not found', async () => {
    mockAccessModel.countDocuments.mockResolvedValue(0);
    mockPermissionModel.findByIdAndDelete.mockResolvedValue(null);

    await expect(service.remove('123')).rejects.toThrow(NotFoundException);
  });

  it('should delete permission if no access is associated', async () => {
    const deleted = { id: '1', name: 'DELETE_USER' };
    mockAccessModel.countDocuments.mockResolvedValue(0);
    mockPermissionModel.findByIdAndDelete.mockResolvedValue(deleted);

    const result = await service.remove('1');
    expect(result).toEqual(deleted);
    expect(mockAccessModel.countDocuments).toHaveBeenCalledWith({ permission: '1' });
    expect(mockPermissionModel.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
