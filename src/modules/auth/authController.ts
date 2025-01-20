import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './localAuthGuard';
import { AuthService } from './authService';
import { Validate } from 'nestjs-typebox';
import { CreateUserBody, CreateUserBodySchema } from '../user/userService.interface';
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
  async signup(data: CreateUserBody, @Res() res) {
    const id = await this.authService.signUp(data);
    return res.status(201).send({ id });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
