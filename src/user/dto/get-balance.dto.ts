import { ApiProperty } from '@nestjs/swagger';

export class GetUserBalanceDto {
  @ApiProperty({
    description: 'The current balance of the user.',
    example: 4000,
  })
  balance: number;
}
