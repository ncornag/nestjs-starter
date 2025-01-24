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
    const idData = await this.authService.signUp(data);
    return res.status(201).send(idData);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res() res) {
    const tokenData = await this.authService.login(req.user);
    return res.status(200).send(tokenData);
  }
}
