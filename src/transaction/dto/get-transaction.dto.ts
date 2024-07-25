import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionDto {
  @ApiProperty({
    description: 'The ID of transaction.',
    example: 1,
  })
  referenceId: number;
}
