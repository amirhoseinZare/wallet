import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the new user.',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'The email address of the new user.',
    example: 'john.doe@example.com',
  })
  email: string;
}
