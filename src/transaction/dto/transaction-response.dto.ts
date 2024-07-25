export class TransactionResponseDto {
  readonly id: number;
  readonly amount: number;
  readonly createdAt: Date;
}

export class UserTransactionResponseDto {
  transactions: TransactionResponseDto[];
  total: number;
}
