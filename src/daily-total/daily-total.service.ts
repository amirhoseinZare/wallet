import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transaction/transaction.entity';
import { DailyTotal } from './daily-total.entity';
import Decimal from 'decimal.js';

@Injectable()
export class DailyTotalService {
  private readonly logger = new Logger(DailyTotalService.name);
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(DailyTotal)
    private readonly dailyTotalRepository: Repository<DailyTotal>,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async calculateDailyTotals() {
    this.logger.verbose('Daily Transaction Calculations started');

    // Set the time range for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Perform an aggregate query to sum the amounts of transactions
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.createdAt >= :yesterday', { yesterday })
      .andWhere('transaction.createdAt < :today', { today })
      .getRawOne();

    // Get the total amount from the result, default to 0 if no transactions found
    const totalAmount = result?.total
      ? new Decimal(result.total).toNumber()
      : 0;

    // Create and save the daily total
    const dailyTotal = new DailyTotal();
    dailyTotal.date = yesterday;
    dailyTotal.totalAmount = totalAmount;

    await this.dailyTotalRepository.save(dailyTotal);
    this.logger.verbose('Daily Transaction Calculations finished successfully');
  }
}
