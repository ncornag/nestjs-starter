import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { LocalAuthGuard } from './localAuthGuard';
import { AuthService } from './authService';
import { Validate } from 'nestjs-typebox';
import { CreateUserBody, CreateUserBodySchema } from '../user/userService.interface';
import { idSchema, IDWithVersionSchema } from 'src/appModule.interfaces';
import { JwtAuthGuard } from './jwtAuthGuard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Validate({
    response: IDWithVersionSchema,
    request: [
      {
        type: 'body',
        schema: CreateUserBodySchema
      }
    ]
  })
  async signup(data: CreateUserBody, @Res({ passthrough: true }) res) {
    const idData = await this.authService.signUp(data);
    res.status(HttpStatus.CREATED);
    return idData;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const tokenData = await this.authService.login(req.user);
    res.status(HttpStatus.OK);
    return tokenData;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Request() req, @Res({ passthrough: true }) res) {
    res.status(HttpStatus.OK);
    return req.user;
  }
}
