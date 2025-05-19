import { Test, TestingModule } from '@nestjs/testing';
import { UserClientService } from './user-client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { UserTokenDto } from './dto/user-token.dto';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserClientService', () => {
  let service: UserClientService;
  let httpService: HttpService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://mocked-security-service/'),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserClientService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UserClientService>(UserClientService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserWithRole', () => {
    it('should create a user and return data', async () => {
      const roleId = '123';
      const token = 'Bearer token';
      const userDto: CreateUserDto = { email: 'test@example.com', password: '123456' } as CreateUserDto;

      const mockResponse: AxiosResponse = {
        data: {
          message: 'User created',
          user: { _id: '1', email: userDto.email, role: 'ADMIN' },
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.post.mockReturnValueOnce(of(mockResponse));

      const result = await service.createUserWithRole(roleId, userDto, token);
      expect(result.user.email).toBe(userDto.email);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        `http://mocked-security-service/user/${roleId}`,
        userDto,
        { headers: { Authorization: token } },
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const token = 'Bearer token';
      const email = 'test@example.com';
      const mockUser: UserTokenDto = {
        id: '1',
        email,
        role: 'REPARTIDOR',
      };

      const mockResponse: AxiosResponse = {
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      const result = await service.findByEmail(email, token);
      expect(result.email).toBe(email);
    });
  });

  describe('verifyUserExists', () => {
    it('should not throw if user exists', async () => {
      const userId = 'user123';
      const token = 'Bearer token';

      const mockResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      await expect(service.verifyUserExists(userId, token)).resolves.not.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const token = 'Bearer token';
      const userId = '1';
      const mockUser: UserTokenDto = {
        id: userId,
        email: 'test@example.com',
        role: 'REPARTIDOR',
      };

      const mockResponse: AxiosResponse = {
        data: mockUser,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      const result = await service.findOne(userId, token);
      expect(result.id).toBe(userId);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const token = 'Bearer token';
      const mockUsers: UserTokenDto[] = [
        { id: '1', email: 'a@example.com', role: 'ADMIN' },
        { id: '2', email: 'b@example.com', role: 'REPARTIDOR' },
      ];

      const mockResponse: AxiosResponse = {
        data: mockUsers,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.get.mockReturnValueOnce(of(mockResponse));

      const result = await service.findAll(token);
      expect(result.length).toBe(2);
    });
  });

  describe('addStoreToUser', () => {
    it('should add store to user without throwing', async () => {
      const userId = '1';
      const storeId = 100;
      const token = 'token';

      const mockResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any },
      };

      mockHttpService.patch.mockReturnValueOnce(of(mockResponse));

      await expect(service.addStoreToUser(userId, storeId, token)).resolves.not.toThrow();
    });
  });

  describe('removeStoreFromUser', () => {
    it('should remove store from user without throwing', async () => {
      const userId = '1';
      const storeId = 100;
      const token = 'token';

      const mockResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} as any},
      };

      mockHttpService.patch.mockReturnValueOnce(of(mockResponse));

      await expect(service.removeStoreFromUser(userId, storeId, token)).resolves.not.toThrow();
    });
  });
});
