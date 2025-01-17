import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/userService';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  CreateUserBody,
  CreateUserBodySchema
} from '../user/userService.interface';

@Injectable()
export class AuthService {
  private saltRounds: number = 10;
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    incommingPassword: string
  ): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user) {
      const ok = await bcrypt.compare(incommingPassword, user.password);
      if (ok) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }
    return null;
  }

  async signUp(data: CreateUserBody) {
    const hash = await bcrypt.hash(data.password, this.saltRounds);
    return this.usersService.create({ ...data, password: hash });
  }

  async login(user: any): Promise<{ access_token: string }> {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
