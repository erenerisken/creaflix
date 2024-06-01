import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { UserLoginDto } from '../application/dtos/user-login.dto';

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
}
