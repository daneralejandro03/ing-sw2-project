import { Test, TestingModule } from '@nestjs/testing';
import { RoleClientService } from './role-client.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

describe('RoleClientService', () => {
  let service: RoleClientService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const BASE_URL = 'http://mock-url/';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleClientService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(BASE_URL),
          },
        },
      ],
    }).compile();

    service = module.get<RoleClientService>(RoleClientService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return role id if role exists', async () => {
    const mockRoles = [{ _id: '123', name: 'Manager' }];
    const response: AxiosResponse = {
      data: mockRoles,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {} as any,
      },
    };
    httpService.get.mockReturnValueOnce(of(response));

    const result = await service.ensureRole('Manager', 'Bearer token');
    expect(result).toBe('123');
    expect(httpService.get).toHaveBeenCalledWith(`${BASE_URL}role`, {
      headers: { Authorization: 'Bearer token' },
    });
  });

  it('should create role if not found', async () => {
    const mockRoles = [];
    const getResponse: AxiosResponse = {
      data: mockRoles,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any },
    };
    httpService.get.mockReturnValueOnce(of(getResponse));

    const postResponse: AxiosResponse = {
      data: { id: '456' },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: { headers: {} as any },
    };
    httpService.post.mockReturnValueOnce(of(postResponse));

    const result = await service.ensureRole('Admin', 'Bearer token');
    expect(result).toBe('456');
  });


  it('should throw error if get fails and post fails too', async () => {
    httpService.get.mockReturnValueOnce(throwError(() => new Error('get failed')));
    httpService.post.mockReturnValueOnce(throwError(() => new Error('post failed')));

    await expect(service.ensureRole('Support', 'Bearer token')).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
