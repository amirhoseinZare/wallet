import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { UserService } from '../user/user.service';
import { TransactionDto } from './dto/transaction.dto';
import { NotFoundException } from '@nestjs/common';
import { NewTransactionDto } from './dto/get-transaction.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: UserService,
          useValue: {
            processTransaction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    userService = module.get<UserService>(UserService);
  });

  describe('processTransaction', () => {
    it('should process a transaction successfully', async () => {
      const transactionDto: TransactionDto = { userId: 1, amount: 100 };
      const newTransactionDto: NewTransactionDto = { referenceId: 1 };
      jest
        .spyOn(userService, 'processTransaction')
        .mockResolvedValue(newTransactionDto);

      const result = await controller.processTransaction(transactionDto);
      expect(result).toEqual(newTransactionDto);
      expect(userService.processTransaction).toHaveBeenCalledWith(
        transactionDto,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const transactionDto: TransactionDto = { userId: 1, amount: 100 };
      jest
        .spyOn(userService, 'processTransaction')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.processTransaction(transactionDto),
      ).rejects.toThrow(NotFoundException);
      expect(userService.processTransaction).toHaveBeenCalledWith(
        transactionDto,
      );
    });
  });
});
