import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { AccessGuard } from '../guards/access.guard';

describe('PermissionController', () => {
  let controller: PermissionController;

  const mockPermissionModel = {};
  const mockAccessModel = {};
  const mockUserModel = {};

  const mockPermissionService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAccessGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
        {
          provide: 'PermissionModel',
          useValue: mockPermissionModel,
        },
        {
          provide: 'AccessModel',
          useValue: mockAccessModel,
        },
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
        {
          provide: AccessGuard,
          useValue: mockAccessGuard,
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
