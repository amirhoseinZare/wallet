import { ApiProperty } from '@nestjs/swagger';

export class NewTransactionDto {
  @ApiProperty({
    description: 'The ID of transaction.',
    example: 1,
  })
  referenceId: number;
}
