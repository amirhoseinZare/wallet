import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SelectFields } from 'src/common/types';
import { GetUserBalanceDto } from './dto/get-balance.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    return { balance: user.balance };
  }
}
