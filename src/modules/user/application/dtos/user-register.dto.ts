import {
  IsEnum,
  IsInt,
  IsString,
  IsStrongPassword,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../../common/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserRegisterDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @ApiProperty({
    description: 'The username of the user',
    minLength: 4,
    maxLength: 20,
  })
  username: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @ApiProperty({ description: 'The password of the user', minLength: 8 })
  password: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ description: 'The age of the user', minimum: 1 })
  age: number;

  @IsEnum(UserRole)
  @ApiProperty({ description: 'The role of the user', enum: UserRole })
  role: UserRole;
}
