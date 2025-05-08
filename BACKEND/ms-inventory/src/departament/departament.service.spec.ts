import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentService } from './departament.service';

describe('DepartamentService', () => {
  let service: DepartamentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartamentService],
    }).compile();

    service = module.get<DepartamentService>(DepartamentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
