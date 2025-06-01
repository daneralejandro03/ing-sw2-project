import { Test, TestingModule } from '@nestjs/testing';
import { RoleClientService } from './role-client.service';

describe('RoleClientService', () => {
  let service: RoleClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleClientService],
    }).compile();

    service = module.get<RoleClientService>(RoleClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
