import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError, AxiosHeaders } from 'axios';

describe('EmailService', () => {
  let service: EmailService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email successfully', async () => {
    const dto = {
      address: 'test@example.com',
      subject: 'Hola',
      plainText: 'Mensaje de prueba',
    };

    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: new AxiosHeaders(),
      },
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    await expect(service.sendMail(dto)).resolves.toBeUndefined();
    expect(httpService.post).toHaveBeenCalledWith('/email/send', dto);
  });

  it('should log and throw error if email sending fails', async () => {
    const dto = {
      address: 'fail@example.com',
      subject: 'Falla',
      plainText: 'Mensaje fallido',
    };

    const axiosError = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      {
        headers: new AxiosHeaders(),
      },
      null,
      {
        data: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        },
      }
    );

    mockHttpService.post.mockReturnValue(throwError(() => axiosError));

    await expect(service.sendMail(dto)).rejects.toThrow('Request failed');
    expect(httpService.post).toHaveBeenCalledWith('/email/send', dto);
  });
});
