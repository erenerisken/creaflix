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

export class UserRegisterDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsEnum(UserRole)
  role: UserRole;
}
