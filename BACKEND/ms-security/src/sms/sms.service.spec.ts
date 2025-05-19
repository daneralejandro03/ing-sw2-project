import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosHeaders } from 'axios';
import { CreateSmDto } from './dto/create-sm.dto';

describe('SmsService', () => {
  let service: SmsService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an SMS and return response', async () => {
    const payload: CreateSmDto = {
      to: '+573001112233',
      body: 'Mensaje de prueba',
    };

    const mockResponse: AxiosResponse = {
      data: {
        data: {
          sid: 'abc123',
          status: 'sent',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    };

    mockHttpService.post.mockReturnValueOnce(of(mockResponse));

    const result = await service.sendSms(payload);

    expect(result).toEqual({
      sid: 'abc123',
      status: 'sent',
      to: payload.to,
      body: payload.body,
    });

    expect(httpService.post).toHaveBeenCalledWith('/sms/send', payload);
  });

  it('should log and throw error when SMS fails', async () => {
    const payload: CreateSmDto = {
      to: '+573001112233',
      body: 'Mensaje de error',
    };

    const error = {
      response: { data: 'Error del servidor' },
      message: 'Request failed',
      isAxiosError: true,
    };

    mockHttpService.post.mockReturnValueOnce(throwError(() => error));

    await expect(service.sendSms(payload)).rejects.toEqual(error);

    expect(httpService.post).toHaveBeenCalledWith('/sms/send', payload);
  });
});
