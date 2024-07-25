import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Transaction } from 'src/transaction/transaction.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { TransactionDto } from 'src/transaction/dto/transaction.dto';
import { GetUserBalanceDto } from './dto/get-balance.dto';
import { plainToInstance } from 'class-transformer';
import { TransactionResponseDto } from 'src/transaction/dto/transaction-response.dto';
import { GetUserTransactionsQueryDto } from 'src/transaction/dto/get-user-transactions-query.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let transactionRepository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
      };
      jest.spyOn(userRepository, 'count').mockResolvedValue(0);
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(createUserDto as any);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(createUserDto as any);

      const result = await service.createUser(createUserDto);
      expect(result).toEqual(createUserDto);
    });

    it('should throw ConflictException if email or username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
      };
      jest.spyOn(userRepository, 'count').mockResolvedValue(1);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return the user with selected fields', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 1000,
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.getUserById(1, [
        'id',
        'username',
        'email',
        'balance',
      ]);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalanceById', () => {
    it('should return the balance of the user', async () => {
      const user = { balance: 1000 };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);

      const result = await service.getBalanceById(1);
      expect(result).toEqual(
        plainToInstance(GetUserBalanceDto, { balance: user.balance }),
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getBalanceById(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('processTransaction', () => {
    it('should process the transaction and update the user balance', async () => {
      const user = { id: 1, balance: 1000 };
      const transactionDto: TransactionDto = { userId: 1, amount: 500 };
      const transaction = { id: 1, amount: 500, user };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user as any);
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(transaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(transaction as any);

      const result = await service.processTransaction(transactionDto);
      expect(result).toEqual({ referenceId: transaction.id });
    });

    it('should throw NotFoundException if user not found', async () => {
      const transactionDto: TransactionDto = { userId: 1, amount: 500 };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.processTransaction(transactionDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserTransactions', () => {
    it('should return a paginated list of user transactions', async () => {
      const user = { id: 1 };
      const pagination: GetUserTransactionsQueryDto = { page: 1, limit: 10 };
      const transactions = [
        { id: 1, amount: 100, createdAt: new Date(), user },
      ] as any;
      const total = 1;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as any);
      jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockResolvedValue([transactions, total]);

      const result = await service.getUserTransactions(1, pagination);
      expect(result).toEqual({
        transactions: transactions.map((transaction) =>
          plainToInstance(TransactionResponseDto, transaction),
        ),
        total,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const pagination: GetUserTransactionsQueryDto = { page: 1, limit: 10 };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserTransactions(1, pagination)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
