import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: (strategy: string) => {
    return jest.fn().mockImplementation(() => ({
      canActivate: jest.fn().mockReturnValue(true),
    }));
  },
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    verify: jest.fn(),
    resend: jest.fn(),
    login: jest.fn(),
    twoFactor: jest.fn(),
    toggleTwoFactor: jest.fn(),
    changePassword: jest.fn(),
    updateProfile: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register with dto including cellPhone', () => {
    const dto = { name: 'User', cellPhone: 1234567890 };
    mockAuthService.register.mockReturnValue({ success: true });

    const result = controller.register(dto.cellPhone, dto as any);
    expect(result).toEqual({ success: true });
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('should call verify with dto', () => {
    const dto = { email: 'user@test.com', code: '1234' };
    mockAuthService.verify.mockReturnValue({ verified: true });

    const result = controller.verify(dto);
    expect(result).toEqual({ verified: true });
    expect(service.verify).toHaveBeenCalledWith(dto);
  });

  it('should call login with dto', () => {
    const dto = { email: 'user@test.com', password: 'pass' };
    mockAuthService.login.mockReturnValue({ token: 'abc' });

    const req = { user: {} };
    const result = controller.login(req, dto);
    expect(result).toEqual({ token: 'abc' });
    expect(service.login).toHaveBeenCalledWith(dto);
  });

  it('should call forgotPassword with email', () => {
    const dto = { email: 'test@test.com' };
    mockAuthService.forgotPassword.mockReturnValue({ sent: true });

    const result = controller.forgotPassword(dto);
    expect(result).toEqual({ sent: true });
    expect(service.forgotPassword).toHaveBeenCalledWith(dto.email);
  });

  it('should call resetPassword with token and newPassword', () => {
    const dto = { token: 'reset-token', newPassword: 'newpass123' };
    mockAuthService.resetPassword.mockReturnValue({ success: true });

    const result = controller.resetPassword(dto);
    expect(result).toEqual({ success: true });
    expect(service.resetPassword).toHaveBeenCalledWith(dto.token, dto.newPassword);
  });
});
