import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards
} from '@nestjs/common';
import { LocalAuthGuard } from './localAuthGuard';
import { AuthService } from './authService';
import { JwtAuthGuard } from './jwtAuthGuard';
import { Validate } from 'nestjs-typebox';
import {
  CreateUserBody,
  CreateUserBodySchema,
  UserResponseSchema
} from '../user/userService.interface';
import { idSchema } from 'src/appModule.interfaces';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Validate({
    response: idSchema,
    request: [
      {
        type: 'body',
        schema: CreateUserBodySchema
      }
    ]
  })
  async signup(data: CreateUserBody) {
    return this.authService.signUp(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    req.logout((err) => {});
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
