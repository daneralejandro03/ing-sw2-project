import { Test, TestingModule } from '@nestjs/testing';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AuthGuard } from '@nestjs/passport';

jest.mock('../guards/access.guard', () => ({
  AccessGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('AccessController', () => {
  let controller: AccessController;
  let service: AccessService;

  const mockAccessService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessController],
      providers: [
        {
          provide: AccessService,
          useValue: mockAccessService,
        },
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<AccessController>(AccessController);
    service = module.get<AccessService>(AccessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct parameters', () => {
    const result = { success: true };
    mockAccessService.create.mockReturnValue(result);

    const permissionId = 'perm-123';
    const roleId = 'role-456';

    const response = controller.create(permissionId, roleId);
    expect(response).toEqual(result);
    expect(service.create).toHaveBeenCalledWith({ permission: permissionId, role: roleId });
  });

  it('should call findAll', () => {
    const result = [{ id: '1', permission: 'p1', role: 'r1' }];
    mockAccessService.findAll.mockReturnValue(result);

    expect(controller.findAll()).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne with correct id', () => {
    const result = { id: '1', permission: 'p1', role: 'r1' };
    mockAccessService.findOne.mockReturnValue(result);

    expect(controller.findOne('1')).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call update with correct id and dto', () => {
    const updateDto: UpdateAccessDto = {
      permission: 'updated-permission',
      role: 'updated-role',
    };
    const result = { id: '1', ...updateDto };
    mockAccessService.update.mockReturnValue(result);

    expect(controller.update('1', updateDto)).toEqual(result);
    expect(service.update).toHaveBeenCalledWith('1', updateDto);
  });

  it('should call remove with correct id', () => {
    const result = { deleted: true };
    mockAccessService.remove.mockReturnValue(result);

    expect(controller.remove('1')).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
