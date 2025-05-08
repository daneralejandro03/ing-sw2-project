import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('JwtAuthGuard', () => {
  const mockJwtService = {} as JwtService;
  expect(new JwtAuthGuard(mockJwtService)).toBeDefined();
});
