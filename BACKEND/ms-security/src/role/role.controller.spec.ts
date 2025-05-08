import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

describe('RoleController', () => {
  let controller: RoleController;

  const mockRoleModel = {}; // Mock del RoleModel
  const mockAccessModel = {}; // Mock del AccessModel
  const mockUserModel = {}; // Mock del UserModel
  const mockPermissionModel = {}; // Mock del PermissionModel

  const mockRoleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService, // Mock del servicio
        },
        {
          provide: 'RoleModel',
          useValue: mockRoleModel, // Mock del RoleModel
        },
        {
          provide: 'AccessModel',
          useValue: mockAccessModel, // Mock del AccessModel
        },
        {
          provide: 'UserModel',
          useValue: mockUserModel, // Mock del UserModel
        },
        {
          provide: 'PermissionModel',
          useValue: mockPermissionModel, // Mock del PermissionModel
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
