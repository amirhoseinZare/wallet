import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetUserTransactionsQueryDto {
  @IsInt()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  readonly page?: number = 1;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  readonly limit?: number = 10;
}
