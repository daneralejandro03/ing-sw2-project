import { Test, TestingModule } from '@nestjs/testing';
import { AccessService } from './access.service';

describe('AccessService', () => {
  let service: AccessService;

  const mockAccessModel = {};
  const mockRoleModel = {};
  const mockPermissionModel = {};
  const mockDatabaseConnection = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          provide: 'DatabaseConnection',
          useValue: mockDatabaseConnection,
        },
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
