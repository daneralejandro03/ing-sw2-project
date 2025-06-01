import { Test, TestingModule } from '@nestjs/testing';
import { GeoAssignmentService } from './geo-assignment.service';

describe('GeoAssignmentService', () => {
  let service: GeoAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoAssignmentService],
    }).compile();

    service = module.get<GeoAssignmentService>(GeoAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
