import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/userModule';
import { AuthService } from './authService';
import { AuthController } from './authController';
import { LocalStrategy } from './localStrategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwtAuthStrategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      privateKey: fs.readFileSync(process.env.PRIVATE_KEY_FILE, 'ascii'),
      signOptions: {
        expiresIn: '365d',
        algorithm: 'RS256'
        // audience?: string | string[] | undefined;
        // subject?: string | undefined;
        // issuer?: string | undefined;
      },
      global: true // needed for AuthGuard2 right now...
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
