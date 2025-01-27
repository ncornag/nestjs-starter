import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/userService';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { _IUserService, CreateUserBody } from '../user/userService.interface';
import { ConfigService } from '@nestjs/config';

export const USER = 'user';

@Injectable()
export class AuthService {
  private passSaltRounds: number;
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(_IUserService)
    private usersService: UserService
  ) {
    this.passSaltRounds = configService.get<number>('PASSWORD_SALT_ROUNDS');
  }

  // Used in the localStrategy
  async validateUser(username: string, incommingPassword: string): Promise<any> {
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
    const hash = await bcrypt.hash(data.password, this.passSaltRounds);
    return this.usersService.create({ ...data, password: hash });
  }

  async login(user: any): Promise<{ access_token: string }> {
    const payload = { sub: user.id, claims: [...user.roles] };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
