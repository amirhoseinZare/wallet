import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GetUserBalanceDto } from './dto/get-balance.dto';
import { GetUserTransactionsQueryDto } from 'src/transaction/dto/get-user-transactions-query.dto';
import { UserTransactionResponseDto } from 'src/transaction/dto/transaction-response.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getBalanceById: jest.fn(),
            getUserById: jest.fn(),
            getUserTransactions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
      };
      const user: any = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 0,
      };
      jest.spyOn(userService, 'createUser').mockResolvedValue(user);

      const result = await controller.createUser(createUserDto);
      expect(result).toEqual(user);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if email or username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
      };
      jest
        .spyOn(userService, 'createUser')
        .mockRejectedValue(
          new ConflictException('Email or Username already in use'),
        );

      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getBalance', () => {
    it('should return the balance of the user', async () => {
      const userId = 1;
      const balanceDto: GetUserBalanceDto = { balance: 1000 };
      jest.spyOn(userService, 'getBalanceById').mockResolvedValue(balanceDto);

      const result = await controller.getBalance(userId);
      expect(result).toEqual(balanceDto);
      expect(userService.getBalanceById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;
      jest
        .spyOn(userService, 'getBalanceById')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.getBalance(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.getBalanceById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserById', () => {
    it('should return the user with selected fields', async () => {
      const userId = 1;
      const user: Partial<User> = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };
      jest.spyOn(userService, 'getUserById').mockResolvedValue(user as any);

      const result = await controller.getUserById(userId, 'id,username,email');
      expect(result).toEqual(user);
      expect(userService.getUserById).toHaveBeenCalledWith(userId, [
        'id',
        'username',
        'email',
      ]);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;
      jest
        .spyOn(userService, 'getUserById')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.getUserById(userId, 'id,username,email'),
      ).rejects.toThrow(NotFoundException);
      expect(userService.getUserById).toHaveBeenCalledWith(userId, [
        'id',
        'username',
        'email',
      ]);
    });
  });

  describe('getUserTransactions', () => {
    it('should return a paginated list of user transactions', async () => {
      const userId = 1;
      const pagination: GetUserTransactionsQueryDto = { page: 1, limit: 10 };
      const transactions: UserTransactionResponseDto = {
        transactions: [],
        total: 0,
      };
      jest
        .spyOn(userService, 'getUserTransactions')
        .mockResolvedValue(transactions);

      const result = await controller.getUserTransactions(userId, pagination);
      expect(result).toEqual(transactions);
      expect(userService.getUserTransactions).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 1;
      const pagination: GetUserTransactionsQueryDto = { page: 1, limit: 10 };
      jest
        .spyOn(userService, 'getUserTransactions')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.getUserTransactions(userId, pagination),
      ).rejects.toThrow(NotFoundException);
      expect(userService.getUserTransactions).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });
  });
});
