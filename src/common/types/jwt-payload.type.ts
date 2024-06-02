import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
  username: string;
  age: number;
  role: UserRole;
  iat: number;
  exp: number;
}
