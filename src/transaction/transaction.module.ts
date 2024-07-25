import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { UserModule } from '../user/user.module';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), UserModule],
  providers: [],
  controllers: [TransactionController],
})
export class TransactionModule {}
