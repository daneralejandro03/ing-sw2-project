import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { EmailService } from '../email/email.service';
import { AuthGuard } from '@nestjs/passport';

jest.mock('../guards/access.guard', () => ({
  AccessGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addStoreToUser: jest.fn(),
    removeStoreFromUser: jest.fn(),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: EmailService, useValue: mockEmailService },
        {
          provide: AuthGuard('jwt'),
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with correct params', async () => {
    const dto = { email: 'test@test.com', password: '1234' };
    const roleId = 'role-1';
    const user = { id: 'admin-id' };
    const req = { user };
    const result = { id: 'user-1', ...dto };

    mockUserService.create.mockResolvedValue(result);

    const response = await controller.create(roleId, dto as any, 3001234567, req as any);
    expect(response).toEqual(result);
    expect(userService.create).toHaveBeenCalledWith({ ...dto, cellPhone: 3001234567 }, roleId, user);
  });

  it('should return all users', async () => {
    const result = [{ id: '1' }];
    mockUserService.findAll.mockResolvedValue(result);

    expect(await controller.findAll()).toEqual(result);
  });

  it('should return one user by id', async () => {
    const result = { id: '1', name: 'Test' };
    mockUserService.findOne.mockResolvedValue(result);

    expect(await controller.findOne('1')).toEqual(result);
  });

  it('should return one user by email', async () => {
    const result = { id: '1', email: 'user@test.com' };
    mockUserService.findOneEmail.mockResolvedValue(result);

    expect(await controller.findOneEmail('user@test.com')).toEqual(result);
  });

  it('should update a user', async () => {
    const dto = { name: 'Updated' };
    const req = { user: { id: 'admin' } };
    const result = { id: '1', ...dto };

    mockUserService.update.mockResolvedValue(result);

    expect(await controller.update('1', dto as any, req as any)).toEqual(result);
  });

  it('should remove a user', async () => {
    const req = { user: { id: 'admin' } };
    const result = { deleted: true };

    mockUserService.remove.mockResolvedValue(result);

    expect(await controller.remove('1', req as any)).toEqual(result);
  });

  it('should add store to user', async () => {
    const dto = { storeId: 10 };
    const result = { id: '1', stores: [dto.storeId] };

    mockUserService.addStoreToUser.mockResolvedValue(result);

    const res = await controller.addStore('1', dto);
    expect(res).toEqual({ message: 'Store añadido al usuario', storeId: 10 });
  });

  it('should remove store from user', async () => {
    const dto = { storeId: 5 };
    const result = { id: '1', stores: [] };

    mockUserService.removeStoreFromUser.mockResolvedValue(result);

    const res = await controller.removeStore('1', dto);
    expect(res).toEqual({ message: 'Store removido del usuario', storeId: 5 });
  });

  it('should throw NotFoundException if addStore fails', async () => {
    mockUserService.addStoreToUser.mockResolvedValue(null);

    await expect(controller.addStore('1', { storeId: 99 })).rejects.toThrowError('User #1 not found');
  });

  it('should throw NotFoundException if removeStore fails', async () => {
    mockUserService.removeStoreFromUser.mockResolvedValue(null);

    await expect(controller.removeStore('1', { storeId: 77 })).rejects.toThrowError('User #1 not found');
  });
});
