import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TransactionDto } from './dto/transaction.dto';
import { ApiTags } from '@nestjs/swagger';
import { NewTransactionDto } from './dto/new-transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly userService: UserService) {}

  /**
   * Processes a transaction to add or subtract money from a user's wallet.
   *
   * @param transactionDto - The DTO containing user ID and amount to be added or deducted.
   * @returns The reference ID of the transaction.
   * @throws NotFoundException if the user with the specified ID is not found.
   */
  @Post('/money')
  async processTransaction(
    @Body() transactionDto: TransactionDto,
  ): Promise<NewTransactionDto> {
    try {
      return await this.userService.processTransaction(transactionDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
