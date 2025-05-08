import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { AccessGuard } from '../guards/access.guard';

describe('UserController', () => {
  let controller: UserController;

  const mockUserModel = {};
  const mockRoleModel = {};
  const mockDatabaseConnection = {};
  const mockEmailService = {};
  const mockPermissionModel = {};
  const mockAccessModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        AccessGuard, // Si lo usas directamente en tu controlador, agrégalo aquí
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
        {
          provide: 'RoleModel',
          useValue: mockRoleModel,
        },
        {
          provide: 'DatabaseConnection',
          useValue: mockDatabaseConnection,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: 'PermissionModel',
          useValue: mockPermissionModel,
        },
        {
          provide: 'AccessModel',
          useValue: mockAccessModel,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
