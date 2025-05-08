import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service'; 
import { SmsService } from '../sms/sms.service';     

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel = {};
  const mockRoleModel = {};
  const mockDatabaseConnection = {};
  const mockJwtService = { sign: jest.fn(), verify: jest.fn() };
  const mockEmailService = { sendEmail: jest.fn() };
  const mockSmsService = { sendSms: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UserModel', useValue: mockUserModel },
        { provide: 'RoleModel', useValue: mockRoleModel },
        { provide: 'DatabaseConnection', useValue: mockDatabaseConnection },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: SmsService, useValue: mockSmsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
