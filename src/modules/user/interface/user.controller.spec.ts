import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { UserLoginDto } from '../application/dtos/user-login.dto';
import { UserRegisterDto } from '../application/dtos/user-register.dto';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../../common/enums/user-role.enum';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('login', () => {
    it('should return a JWT token if login is successful', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'testuser',
        password: 'password123',
      };
      const token = 'jwt-token-string';

      jest.spyOn(userService, 'login').mockResolvedValueOnce(token);

      const result = await controller.login(userLoginDto);

      expect(result).toEqual({ token });
      expect(userService.login).toHaveBeenCalledWith(userLoginDto);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'nonexistentuser',
        password: 'password123',
      };

      jest
        .spyOn(userService, 'login')
        .mockRejectedValueOnce(new NotFoundException('User not found'));

      await expect(controller.login(userLoginDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.login).toHaveBeenCalledWith(userLoginDto);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const userLoginDto: UserLoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      jest
        .spyOn(userService, 'login')
        .mockRejectedValueOnce(
          new UnauthorizedException('Invalid credentials'),
        );

      await expect(controller.login(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.login).toHaveBeenCalledWith(userLoginDto);
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

      jest.spyOn(userService, 'register').mockResolvedValueOnce(undefined);

      const result = await controller.register(userRegisterDto);

      expect(result).toEqual({ result: 'success' });
      expect(userService.register).toHaveBeenCalledWith(userRegisterDto);
    });

    it('should throw ConflictException if username already exists', async () => {
      const userRegisterDto: UserRegisterDto = {
        username: 'existinguser',
        password: 'password123',
        age: 30,
        role: UserRole.CUSTOMER,
      };

      jest
        .spyOn(userService, 'register')
        .mockRejectedValueOnce(
          new ConflictException('Username already exists'),
        );

      await expect(controller.register(userRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.register).toHaveBeenCalledWith(userRegisterDto);
    });
  });
});
