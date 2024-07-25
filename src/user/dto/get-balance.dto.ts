import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetUserBalanceDto {
  @Transform(({ value }) => +value)
  @ApiProperty({
    description: 'The current balance of the user.',
    example: 4000,
  })
  balance: number;
}
