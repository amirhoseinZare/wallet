import { Transform } from 'class-transformer';

export class TransactionResponseDto {
  readonly id: number;

  @Transform(({ value }) => +value)
  readonly amount: number;

  readonly createdAt: Date;
}

export class UserTransactionResponseDto {
  transactions: TransactionResponseDto[];
  total: number;
}
