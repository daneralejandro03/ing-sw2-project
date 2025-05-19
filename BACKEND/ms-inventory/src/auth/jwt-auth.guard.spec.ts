import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(() => {
    jwtService = mockJwtService as unknown as JwtService;
    guard = new JwtAuthGuard(jwtService);
  });

  const mockExecutionContext = (authHeader?: string): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  } as unknown as ExecutionContext);

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access with valid token', () => {
    const payload = { id: '1', email: 'test@example.com', role: 'Admin' };
    mockJwtService.verify = jest.fn().mockReturnValue(payload);

    const context = mockExecutionContext('Bearer valid.token.here');

    expect(guard.canActivate(context)).toBe(true);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid.token.here');
  });

  it('should throw if token is missing', () => {
    const context = mockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw if token is invalid', () => {
    mockJwtService.verify = jest.fn(() => {
      throw new Error('invalid');
    });

    const context = mockExecutionContext('Bearer invalid.token');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw if token format is incorrect', () => {
    const context = mockExecutionContext('InvalidHeader');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
