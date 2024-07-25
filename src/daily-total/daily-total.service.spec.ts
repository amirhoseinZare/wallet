import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyTotalService } from './daily-total.service';
import { Transaction } from '../transaction/transaction.entity';
import { DailyTotal } from './daily-total.entity';

describe('DailyTotalService', () => {
  let service: DailyTotalService;
  let transactionRepository: Repository<Transaction>;
  let dailyTotalRepository: Repository<DailyTotal>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyTotalService,
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(DailyTotal),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DailyTotalService>(DailyTotalService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    dailyTotalRepository = module.get<Repository<DailyTotal>>(
      getRepositoryToken(DailyTotal),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateDailyTotals', () => {
    it('should calculate and save daily totals correctly', async () => {
      const mockTransactions = [
        {
          id: 1,
          amount: '100',
          createdAt: new Date('2023-07-24T00:00:00Z'),
          user: {},
        },
        {
          id: 2,
          amount: '200',
          createdAt: new Date('2023-07-24T12:00:00Z'),
          user: {},
        },
        {
          id: 3,
          amount: '-50',
          createdAt: new Date('2023-07-24T23:59:59Z'),
          user: {},
        },
      ];

      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTransactions),
      } as any);

      const saveSpy = jest
        .spyOn(dailyTotalRepository, 'save')
        .mockResolvedValue({} as DailyTotal);

      await service.calculateDailyTotals();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 250.25,
        }),
      );
    });

    it('should handle no transactions for the day', async () => {
      jest.spyOn(transactionRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      } as any);

      const saveSpy = jest
        .spyOn(dailyTotalRepository, 'save')
        .mockResolvedValue({} as DailyTotal);

      await service.calculateDailyTotals();

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 0,
        }),
      );
    });
  });
});
