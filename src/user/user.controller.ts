import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetUserBalanceDto } from './dto/get-balance.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserTransactionResponseDto } from 'src/transaction/dto/transaction-response.dto';
import { GetUserTransactionsQueryDto } from 'src/transaction/dto/get-user-transactions-query.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Creates a new user with the provided username and email.
   *
   * @param createUserDto - The DTO containing the username and email for the new user.
   * @returns The created user entity.
   * @throws ConflictException if the email or username is already in use.
   */
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  /**
   * Retrieves the balance of a user by their ID.
   *
   * @param userId - The ID of the user to retrieve the balance for.
   * @returns A JSON object containing the user's balance.
   * @throws NotFoundException if no user with the specified ID is found.
   */
  @Get('/balance/:userId')
  async getBalance(
    @Param('userId') userId: number,
  ): Promise<GetUserBalanceDto> {
    try {
      return await this.userService.getBalanceById(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  /**
   * Retrieves a user by their ID with selectable fields.
   *
   * @param id - The ID of the user to retrieve.
   * @param fields - A query parameter specifying which fields to include in the response.
   * @returns The user entity with the specified fields.
   */
  @Get('details/:userId')
  @ApiQuery({ name: 'fields', required: false })
  async getUserById(
    @Param('userId') id: number,
    @Query('fields') fields?: string, // Comma-separated list of fields
  ): Promise<Partial<User>> {
    // Parse the fields query parameter into an array of strings
    const fieldsArray = fields
      ? (fields.split(',') as (keyof User)[])
      : undefined;

    // Call the service method with the ID and fields
    return this.userService.getUserById(id, fieldsArray);
  }

  /**
   * Gets a list of transactions for a specified user with pagination.
   *
   * @param userId - The ID of the user whose transactions are to be retrieved.
   * @param pagination - Pagination parameters including page and limit.
   * @returns A paginated list of transactions for the user.
   */
  @Get('transactions/:userId')
  @ApiQuery({
    name: 'page',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    example: 10,
  })
  async getUserTransactions(
    @Param('userId') userId: number,
    @Query() pagination: GetUserTransactionsQueryDto,
  ): Promise<UserTransactionResponseDto> {
    return this.userService.getUserTransactions(userId, pagination);
  }
}
