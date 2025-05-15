import { Test, TestingModule } from '@nestjs/testing';
import { ProductSubscriber } from './product-subscriber';

describe('ProductSubscriber', () => {
  let provider: ProductSubscriber;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSubscriber],
    }).compile();

    provider = module.get<ProductSubscriber>(ProductSubscriber);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
