import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { AuthGuard } from '@nestjs/passport';

jest.mock('../guards/access.guard', () => ({
  AccessGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  const mockRoleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct data', () => {
    const dto = { name: 'Admin' };
    const result = { id: '1', name: 'Admin' };

    mockRoleService.create.mockReturnValue(result);
    expect(controller.create(dto)).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', () => {
    const result = [{ id: '1', name: 'Admin' }];
    mockRoleService.findAll.mockReturnValue(result);

    expect(controller.findAll()).toEqual(result);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne with correct id', () => {
    const result = { id: '1', name: 'Admin' };
    mockRoleService.findOne.mockReturnValue(result);

    expect(controller.findOne('1')).toEqual(result);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call update with correct id and data', () => {
    const dto = { name: 'User' };
    const result = { id: '1', name: 'User' };

    mockRoleService.update.mockReturnValue(result);
    expect(controller.update('1', dto)).toEqual(result);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });

  it('should call remove with correct id', () => {
    const result = { deleted: true };
    mockRoleService.remove.mockReturnValue(result);

    expect(controller.remove('1')).toEqual(result);
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
