import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from '../email/email.service';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockRoleModel = {
    findById: jest.fn(),
    updateOne: jest.fn(),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
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
        UserService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Role'), useValue: mockRoleModel },
        { provide: 'DatabaseConnection', useValue: mockConnection },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if email already exists when creating user', async () => {
    mockRoleModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ name: 'Administrator', _id: 'admin-role' }),
    });

    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
    });

    const dto = {
      email: 'test@example.com',
      password: '123456',
    };

    await expect(
      service.create(dto as any, 'admin-role', { role: 'admin-role' } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
