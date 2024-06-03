import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { UserLoginDto } from '../application/dtos/user-login.dto';
import { UserRegisterDto } from '../application/dtos/user-register.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: UserLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    schema: {
      example: { token: 'jwt-token-string' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async login(@Body() userLoginDto: UserLoginDto) {
    const token = await this.userService.login(userLoginDto);

    return {
      token,
    };
  }

  @Post('/register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: UserRegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Duplicate user' })
  async register(@Body() userRegisterDto: UserRegisterDto) {
    await this.userService.register(userRegisterDto);

    return { result: 'success' };
  }
}
