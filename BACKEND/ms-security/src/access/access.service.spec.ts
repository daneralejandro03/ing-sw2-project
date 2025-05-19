import { Test, TestingModule } from '@nestjs/testing';
import { AccessService } from './access.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AccessService', () => {
  let service: AccessService;

  const mockAccessModel = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
  };

  const mockRoleModel = {
    updateOne: jest.fn(),
  };

  const mockPermissionModel = {
    updateOne: jest.fn(),
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockReturnValue(mockSession),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessService,
        { provide: getModelToken('Access'), useValue: mockAccessModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: getModelToken('Permission'), useValue: mockPermissionModel },
        { provide: 'DatabaseConnection', useValue: mockConnection },
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if permission not found when creating access', async () => {
    const dto = { role: 'role-id', permission: 'perm-id' };

    mockAccessModel.create.mockResolvedValue([{ _id: 'access-id', ...dto }]);

    mockPermissionModel.updateOne.mockResolvedValue({ matchedCount: 0 });

    await expect(service.create(dto as any)).rejects.toThrow(NotFoundException);

    expect(mockPermissionModel.updateOne).toHaveBeenCalledWith(
      { _id: 'perm-id' },
      { $addToSet: { access: 'access-id' } },
      { session: mockSession },
    );
  });
});
