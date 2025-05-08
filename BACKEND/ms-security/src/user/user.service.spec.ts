import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service'; 

describe('UserService', () => {
  let service: UserService;

  const mockUserModel = {};
  const mockRoleModel = {};
  const mockDatabaseConnection = {};
  const mockEmailService = { sendEmail: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserModel', useValue: mockUserModel },
        { provide: 'RoleModel', useValue: mockRoleModel },
        { provide: 'DatabaseConnection', useValue: mockDatabaseConnection },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
