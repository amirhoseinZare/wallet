import { Module } from '@nestjs/common';
import { DailyTotalService } from './daily-total.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transaction/transaction.entity';
import { DailyTotal } from './daily-total.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, DailyTotal])],
  providers: [DailyTotalService],
})
export class DailyTotalModule {}
