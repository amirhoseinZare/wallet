import { Test, TestingModule } from '@nestjs/testing';
import { DailyTotalService } from './daily-total.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { DailyTotal } from './daily-total.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import Decimal from 'decimal.js';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  }),
  save: jest.fn(),
});

describe('DailyTotalService', () => {
  let service: DailyTotalService;
  let transactionRepository: MockRepository;
  let dailyTotalRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyTotalService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(DailyTotal),
          useValue: createMockRepository(),
        },
        {
          provide: Logger,
          useValue: {
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DailyTotalService>(DailyTotalService);
    transactionRepository = module.get<MockRepository>(
      getRepositoryToken(Transaction),
    );
    dailyTotalRepository = module.get<MockRepository>(
      getRepositoryToken(DailyTotal),
    );
  });

  describe('calculateDailyTotals', () => {
    it('should calculate and save daily totals successfully', async () => {
      const mockResult = { total: '100.00' };
      transactionRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue(mockResult);

      const saveSpy = jest
        .spyOn(dailyTotalRepository, 'save')
        .mockResolvedValue(null);

      await service.calculateDailyTotals();

      expect(transactionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(
        transactionRepository.createQueryBuilder().select,
      ).toHaveBeenCalledWith('SUM(transaction.amount)', 'total');
      expect(
        transactionRepository.createQueryBuilder().where,
      ).toHaveBeenCalled();
      expect(
        transactionRepository.createQueryBuilder().andWhere,
      ).toHaveBeenCalled();
      expect(
        transactionRepository.createQueryBuilder().getRawOne,
      ).toHaveBeenCalled();

      const expectedTotalAmount = new Decimal(mockResult.total).toNumber();
      const expectedDailyTotal = {
        date: expect.any(Date),
        totalAmount: expectedTotalAmount,
      };

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining(expectedDailyTotal),
      );
    });

    it('should handle no transactions gracefully', async () => {
      transactionRepository
        .createQueryBuilder()
        .getRawOne.mockResolvedValue(null);

      const saveSpy = jest
        .spyOn(dailyTotalRepository, 'save')
        .mockResolvedValue(null);

      await service.calculateDailyTotals();

      expect(
        transactionRepository.createQueryBuilder().getRawOne,
      ).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ totalAmount: 0 }),
      );
    });
  });
});
