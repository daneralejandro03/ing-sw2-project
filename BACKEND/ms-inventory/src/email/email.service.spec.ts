import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { HttpService } from '@nestjs/axios';
import { CreateEmailDto } from './dto/create-email.dto';
import { of, throwError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

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
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email successfully', async () => {
    const dto: CreateEmailDto = {
      address: 'test@example.com',
      subject: 'Test',
      plainText: 'Hello',
    };

    const mockResponse: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as any }, // Añadir headers para evitar error de tipado
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    await expect(service.sendMail(dto)).resolves.toBeUndefined();
    expect(httpService.post).toHaveBeenCalledWith('/email/send', dto);
  });

  it('should log and throw error if email sending fails', async () => {
    const dto: CreateEmailDto = {
      address: 'fail@example.com',
      subject: 'Fail',
      plainText: 'Error',
    };

    const error = new Error('Request failed') as AxiosError;
    error.isAxiosError = true;
    error.response = {
      data: 'Request failed',
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: { headers: {} as any },
    };

    mockHttpService.post.mockReturnValue(throwError(() => error));

    await expect(service.sendMail(dto)).rejects.toThrow('Request failed');
    expect(httpService.post).toHaveBeenCalledWith('/email/send', dto);
  });

});
