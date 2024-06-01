import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { UserLoginDto } from '../application/dtos/user-login.dto';
import { UserRegisterDto } from '../application/dtos/user-register.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/login')
  @HttpCode(200)
  async login(@Body() userLoginDto: UserLoginDto) {
    const token = await this.userService.login(userLoginDto);

    return {
      token,
    };
  }

  @Post('/register')
  async register(@Body() userRegisterDto: UserRegisterDto) {
    await this.userService.register(userRegisterDto);

    return { result: 'success' };
  }
}
