import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { HttpService } from '@nestjs/axios'; // Asegúrate de importar correctamente HttpService

describe('EmailService', () => {
  let service: EmailService;

  const mockHttpService = { post: jest.fn() }; // Mock de HttpService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: HttpService, useValue: mockHttpService }, // Proveer el mock
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
