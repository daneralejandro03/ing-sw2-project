import { Test, TestingModule } from '@nestjs/testing';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';

describe('AccessController', () => {
  let controller: AccessController;

  const mockAccessModel = {};
  const mockRoleModel = {};
  const mockPermissionModel = {};
  const mockUserModel = {};
  const mockDatabaseConnection = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessController],
      providers: [
        AccessService,
        {
          provide: 'AccessModel',
          useValue: mockAccessModel,
        },
        {
          provide: 'RoleModel',
          useValue: mockRoleModel,
        },
        {
          provide: 'PermissionModel',
          useValue: mockPermissionModel,
        },
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
        {
          provide: 'DatabaseConnection',
          useValue: mockDatabaseConnection,
        },
      ],
    }).compile();

    controller = module.get<AccessController>(AccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
