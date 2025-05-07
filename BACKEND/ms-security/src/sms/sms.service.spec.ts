import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { HttpService } from '@nestjs/axios';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        {
          provide: HttpService,
          useValue: {}, 
        },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
