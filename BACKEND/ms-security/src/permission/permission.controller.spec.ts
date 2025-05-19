import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { AuthGuard } from '@nestjs/passport';

jest.mock('../guards/access.guard', () => ({
  AccessGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('PermissionController', () => {
  let controller: PermissionController;
  let service: PermissionService;

  const mockPermissionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: mockPermissionService,
        },
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    service = module.get<PermissionService>(PermissionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct dto', () => {
    const dto = {
      name: 'CREATE_USER',
      url: '/user',
      method: 'POST',
      module: 'User',
      description: 'Permiso para crear usuarios',
    };
    const result = { id: '1', ...dto };

    mockPermissionService.create.mockReturnValue(result);
    expect(controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', () => {
    const result = [{ id: '1', name: 'CREATE_USER' }];
    mockPermissionService.findAll.mockReturnValue(result);

    expect(controller.findAll()).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne with correct id', () => {
    const result = { id: '1', name: 'CREATE_USER' };
    mockPermissionService.findOne.mockReturnValue(result);

    expect(controller.findOne('1')).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call update with correct id and dto', () => {
    const dto = {
      name: 'UPDATED_PERMISSION',
      url: '/user',
      method: 'PUT',
      module: 'User',
      description: 'Permiso actualizado',
    };
    const result = { id: '1', ...dto };

    mockPermissionService.update.mockReturnValue(result);
    expect(controller.update('1', dto)).toEqual(result);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('should call remove with correct id', () => {
    const result = { deleted: true };
    mockPermissionService.remove.mockReturnValue(result);

    expect(controller.remove('1')).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
