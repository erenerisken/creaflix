import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserLoginDto } from './dtos/user-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { Repository } from 'typeorm';
import { generateSalt, getPasswordHash } from '../utils/password.utils';
import { JwtPayload } from '../../../common/types/jwt-payload.type';
import { UserRole } from '../../../common/types/user-role.enum';
import { getExpTimestamp } from '../utils/token.utils';
import { sign } from 'jsonwebtoken';
import * as process from 'process';
import { UserRegisterDto } from './dtos/user-register.dto';
import { isDbStatusConflict } from '../../../common/utils/psql.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async login(userLoginDto: UserLoginDto): Promise<string> {
    const user = await this.userRepository.findOneBy({
      username: userLoginDto.username,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = getPasswordHash(userLoginDto.password, user.salt);
    if (passwordHash != user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwtPayload: JwtPayload = {
      username: user.username,
      age: user.age,
      role: user.role as UserRole,
      iat: Math.floor(new Date().getTime() / 1000),
      exp: getExpTimestamp(),
    };

    return sign(jwtPayload, process.env.JWT_SECRET, { algorithm: 'HS256' });
  }

  async register(userRegisterDto: UserRegisterDto): Promise<void> {
    const newUser = new User();
    newUser.username = userRegisterDto.username;
    newUser.salt = generateSalt();
    newUser.password = getPasswordHash(userRegisterDto.password, newUser.salt);
    newUser.age = userRegisterDto.age;
    newUser.role = userRegisterDto.role;

    try {
      await this.userRepository.save(newUser);
    } catch (err) {
      if (isDbStatusConflict(err.code)) {
        throw new ConflictException('Username already exists');
      }
      throw err;
    }
  }
}
