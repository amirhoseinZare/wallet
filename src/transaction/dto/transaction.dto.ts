import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({
    description: 'The ID of the user whose wallet is being updated.',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description:
      "The amount to be added or subtracted from the user's wallet. Negative values represent deductions.",
    example: 100,
  })
  amount: number;
}
