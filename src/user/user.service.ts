import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SelectFields } from 'src/common/types';
import { GetUserBalanceDto } from './dto/get-balance.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { TransactionDto } from 'src/transaction/dto/transaction.dto';
import { Transaction } from 'src/transaction/transaction.entity';
import Decimal from 'decimal.js';
import {
  TransactionResponseDto,
  UserTransactionResponseDto,
} from 'src/transaction/dto/transaction-response.dto';
import { GetUserTransactionsQueryDto } from 'src/transaction/dto/get-user-transactions-query.dto';
import { NewTransactionDto } from 'src/transaction/dto/get-transaction.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Creates a new user with the provided username and email.
   *
   * This method first checks if a user with the given email or username already exists
   * using an efficient count query. If an existing user is found, it throws a ConflictException.
   * If no existing user is found, it creates a new user entity and saves it to the database.
   *
   * @param createUserDto - The DTO containing username and email of the new user.
   * @returns The created user entity.
   * @throws ConflictException if the email or username is already in use.
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email } = createUserDto;

    // Using count query for the most efficient existence checking
    const existingUserCount = await this.userRepository.count({
      where: [{ email }, { username }],
    });

    // If any existing user is found with the provided email or username, throw a conflict exception
    if (existingUserCount > 0) {
      throw new ConflictException('Email or Username already in use');
    }

    // Create and save the new user if no existing user is found
    const user = this.userRepository.create({ username, email });
    return this.userRepository.save(user);
  }

  /**
   * Retrieves a user by their ID with dynamically selectable fields.
   *
   * This method queries the database to find a user with the specified ID. The fields to be
   * included in the result are specified by the `fields` parameter. If the user is not found,
   * a NotFoundException is thrown. Otherwise, the user entity with the specified fields is returned.
   *
   * @param id - The ID of the user to retrieve.
   * @param fields - An array of field names to include in the result. If not provided, default fields are used.
   * @returns A user entity with the specified fields.
   * @throws NotFoundException if no user with the specified ID is found in the database.
   */
  async getUserById<T extends keyof User>(
    id: number,
    fields: T[] = ['id', 'username', 'email', 'balance'] as T[],
  ): Promise<SelectFields<User, T>> {
    // Query the database for a user with the specified ID and select the dynamically specified fields
    const user = await this.userRepository.findOne({
      where: { id },
      select: fields,
    });

    // If no user is found with the given ID, throw a NotFoundException
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return the found user entity with the specified fields
    return user as SelectFields<User, T>;
  }

  /**
   * Retrieves the balance of a user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   * @returns An object containing the user's balance.
   * @throws NotFoundException if no user with the specified ID is found in the database.
   */
  async getBalanceById(id: number): Promise<GetUserBalanceDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['balance'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(GetUserBalanceDto, { balance: user.balance });
  }

  /**
   * Adds or subtracts money from a user's wallet and records the transaction.
   *
   * @param transactionDto - The DTO containing user ID and amount to be added or deducted.
   * @returns The reference ID of the transaction.
   * @throws NotFoundException if the user with the specified ID is not found.
   */
  async processTransaction(
    transactionDto: TransactionDto,
  ): Promise<NewTransactionDto> {
    const { userId, amount } = transactionDto;

    // Find the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'balance'],
    });

    // Throw an exception if the user is not found
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use Decimal.js to handle decimal arithmetic
    const decimalAmount = new Decimal(amount);
    const decimalBalance = new Decimal(user.balance);

    // Update the user's balance
    user.balance = decimalBalance.plus(decimalAmount).toNumber();
    await this.userRepository.save(user);

    // Record the transaction
    const transaction = this.transactionRepository.create({
      user, // Assign the user entity
      amount: decimalAmount.toNumber(), // Set the amount
    });
    const savedTransaction = await this.transactionRepository.save(transaction);

    // Return the reference ID of the transaction
    return { referenceId: savedTransaction.id };
  }

  /**
   * Retrieves a list of transactions for a specified user with pagination.
   *
   * @param userId - The ID of the user whose transactions are to be retrieved.
   * @param pagination - Pagination parameters including page and limit.
   * @returns A paginated list of transactions for the user.
   * @throws NotFoundException if the user with the specified ID is not found.
   */
  async getUserTransactions(
    userId: number,
    pagination: GetUserTransactionsQueryDto,
  ): Promise<UserTransactionResponseDto> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { page, limit } = pagination;

    const skip = (page - 1) * limit;

    // Query for transactions with pagination
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        select: {
          id: true,
          amount: true,
          createdAt: true,
          user: {},
        },
        where: { user },
        skip,
        take: limit,
        order: { createdAt: 'DESC' }, // Order by date descending
      },
    );

    const transactionDtos = transactions.map((transaction) =>
      plainToInstance(TransactionResponseDto, transaction),
    );

    return { transactions: transactionDtos, total };
  }
}
