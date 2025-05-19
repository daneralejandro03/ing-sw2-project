import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RoleService', () => {
  let service: RoleService;

  const mockRoleModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const mockAccessModel = {
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: getModelToken('Access'), useValue: mockAccessModel },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException if role already exists', async () => {
    mockRoleModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ name: 'Admin' }),
    });

    await expect(service.create({ name: 'Admin' })).rejects.toThrow(BadRequestException);
    expect(mockRoleModel.findOne).toHaveBeenCalledWith({ name: 'Admin' });
  });

  it('should create a role if it does not exist', async () => {
    const dto = { name: 'User' };
    const created = { _id: '1', ...dto };

    mockRoleModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockRoleModel.create.mockResolvedValue(created);

    const result = await service.create(dto);
    expect(result).toEqual(created);
    expect(mockRoleModel.create).toHaveBeenCalledWith(dto);
  });

  it('should return all roles', async () => {
    const result = [{ id: '1', name: 'Admin' }];
    mockRoleModel.find.mockResolvedValue(result);

    expect(await service.findAll()).toEqual(result);
  });

  it('should return a role by id', async () => {
    const result = { id: '1', name: 'Admin' };
    mockRoleModel.findById.mockResolvedValue(result);

    expect(await service.findOne('1')).toEqual(result);
  });

  it('should update a role', async () => {
    const dto = { name: 'Updated' };
    const result = { id: '1', ...dto };

    mockRoleModel.findByIdAndUpdate.mockResolvedValue(result);

    expect(await service.update('1', dto)).toEqual(result);
  });

  it('should throw if role has access associated (remove)', async () => {
    mockAccessModel.countDocuments.mockResolvedValue(2);

    await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    expect(mockAccessModel.countDocuments).toHaveBeenCalledWith({ role: '1' });
  });

  it('should throw if role not found when deleting', async () => {
    mockAccessModel.countDocuments.mockResolvedValue(0);
    mockRoleModel.findByIdAndDelete.mockResolvedValue(null);

    await expect(service.remove('99')).rejects.toThrow(NotFoundException);
  });

  it('should delete role successfully', async () => {
    const deleted = { id: '1', name: 'User' };

    mockAccessModel.countDocuments.mockResolvedValue(0);
    mockRoleModel.findByIdAndDelete.mockResolvedValue(deleted);

    const result = await service.remove('1');
    expect(result).toEqual(deleted);
    expect(mockRoleModel.findByIdAndDelete).toHaveBeenCalledWith('1');
  });
});
