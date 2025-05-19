import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockRoleModel = {
    findOne: jest.fn(),
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

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  const mockSmsService = {
    sendSms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: 'DatabaseConnection', useValue: mockConnection }, 
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

  it('should throw if email already exists on register', async () => {
    mockUserModel.findOne.mockResolvedValue({ email: 'exists@test.com' });

    await expect(
      service.register({ email: 'exists@test.com', password: '1234' } as any),
    ).rejects.toThrow('Email ya registrado');
  });
});
