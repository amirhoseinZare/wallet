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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyTotals() {
    this.logger.verbose('Daily Transaction Calculations started');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.createdAt >= :yesterday', { yesterday })
      .andWhere('transaction.createdAt < :today', { today })
      .getMany();

    const total = transactions.reduce(
      (sum, transaction) => sum.plus(new Decimal(transaction.amount)),
      new Decimal(0),
    );

    const dailyTotal = new DailyTotal();
    dailyTotal.date = yesterday;
    dailyTotal.totalAmount = total.toNumber();

    await this.dailyTotalRepository.save(dailyTotal);
    this.logger.verbose('Daily Transaction Calculations finished successfullt');
  }
}
