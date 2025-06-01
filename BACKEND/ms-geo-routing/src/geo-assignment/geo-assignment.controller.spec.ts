import { Test, TestingModule } from '@nestjs/testing';
import { GeoAssignmentController } from './geo-assignment.controller';
import { GeoAssignmentService } from './geo-assignment.service';

describe('GeoAssignmentController', () => {
  let controller: GeoAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoAssignmentController],
      providers: [GeoAssignmentService],
    }).compile();

    controller = module.get<GeoAssignmentController>(GeoAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
