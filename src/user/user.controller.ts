import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: { username: string; email: string },
  ): Promise<User> {
    return this.userService.createUser(
      createUserDto.username,
      createUserDto.email,
    );
  }

  /**
   * Retrieves a user by their ID with selectable fields.
   *
   * @param id - The ID of the user to retrieve.
   * @param fields - A query parameter specifying which fields to include in the response.
   * @returns The user entity with the specified fields.
   */
  @Get(':id')
  async getUserById(
    @Param('id') id: number,
    @Query('fields') fields?: string, // Comma-separated list of fields
  ): Promise<Partial<User>> {
    // Parse the fields query parameter into an array of strings
    const fieldsArray = fields
      ? (fields.split(',') as (keyof User)[])
      : undefined;

    // Call the service method with the ID and fields
    return this.userService.getUserById(id, fieldsArray);
  }
}
