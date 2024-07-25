import { Test, TestingModule } from '@nestjs/testing';
import { DailyTotalService } from './daily-total.service';

describe('DailyTotalService', () => {
  let service: DailyTotalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyTotalService],
    }).compile();

    service = module.get<DailyTotalService>(DailyTotalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
