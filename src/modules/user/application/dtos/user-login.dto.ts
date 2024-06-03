import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @IsString()
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @IsString()
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
