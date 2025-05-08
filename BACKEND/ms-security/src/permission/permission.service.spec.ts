import { Test, TestingModule } from '@nestjs/testing';
import { PermissionService } from './permission.service';

describe('PermissionService', () => {
  let service: PermissionService;

  const mockPermissionModel = {}; // Simulación de PermissionModel
  const mockAccessModel = {};     // Simulación de AccessModel

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionService,
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

    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
