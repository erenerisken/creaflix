import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { Repository } from 'typeorm';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegisterDto } from './dtos/user-register.dto';
import { UserRole } from '../../../common/enums/user-role.enum';
import { sign } from 'jsonwebtoken';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateSalt, getPasswordHash } from '../utils/password.utils';

jest.mock('../utils/password.utils', () => ({
  generateSalt: jest.fn(),
  getPasswordHash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('login', () => {
    it('should return a JWT token if credentials are valid', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password',
        salt: 'salt',
        age: 30,
        role: UserRole.CUSTOMER,
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(user as User);
      (getPasswordHash as jest.Mock).mockReturnValue('hashed_password');
      (sign as jest.Mock).mockReturnValue('jwt_token');

      const result = await service.login(userLoginDto);
      expect(result).toBe('jwt_token');
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'nonexistentuser',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.login(userLoginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashed_password',
        salt: 'salt',
        age: 30,
        role: UserRole.CUSTOMER,
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(user as User);
      (getPasswordHash as jest.Mock).mockReturnValue('wrong_hashed_password');

      await expect(service.login(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userRegisterDto: UserRegisterDto = {
        username: 'newuser',
        password: 'password123',
        age: 30,
        role: UserRole.CUSTOMER,
      };
      const newUser = {
        id: 1,
        ...userRegisterDto,
        password: 'hashed_password',
        salt: 'salt',
      };

      (generateSalt as jest.Mock).mockReturnValue('salt');
      (getPasswordHash as jest.Mock).mockReturnValue('hashed_password');
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(newUser as User);

      await expect(service.register(userRegisterDto)).resolves.not.toThrow();
    });

    it('should throw ConflictException if username already exists', async () => {
      const userRegisterDto: UserRegisterDto = {
        username: 'existinguser',
        password: 'password123',
        age: 30,
        role: UserRole.CUSTOMER,
      };
      const error = { code: '23505' };

      jest.spyOn(userRepository, 'save').mockRejectedValueOnce(error);

      await expect(service.register(userRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
