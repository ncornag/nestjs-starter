import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/userModule';
import { AuthService } from './authService';
import { AuthController } from './authController';
import { LocalStrategy } from './localStrategy';
import { JwtStrategy } from './jwtAuthStrategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      privateKey: fs.readFileSync(process.env.PRIVATE_KEY_FILE, 'ascii'),
      signOptions: {
        expiresIn: '365d',
        algorithm: 'RS256'
      },
      global: true
    }),
    UserModule,
    PassportModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
