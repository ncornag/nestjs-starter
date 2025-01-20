import * as fs from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly cls: ClsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(process.env.PUBLIC_KEY_FILE, 'ascii')
    });
  }

  async validate(payload) {
    // TODO Check revoqued tokens?
    // TODO Validate user exists and is still valid?
    // TODO Enrich the user object?
    const userData = { id: payload.sub, claims: payload.claims };
    this.cls.set('user', userData);
    return userData;
  }
}
