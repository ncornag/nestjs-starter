import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/userModule';
import { AuthService } from './authService';
import { AuthController } from './authController';
import { LocalStrategy } from './localStrategy';
import { JwtStrategy } from './jwtAuthStrategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    //JwtModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        privateKey: fs.readFileSync(config.getOrThrow<string>('PRIVATE_KEY_FILE'), 'ascii'),
        signOptions: {
          issuer: config.getOrThrow<string>('TOKEN_ISS'),
          audience: config.getOrThrow<string>('TOKEN_AUD'),
          expiresIn: config.getOrThrow<string>('TOKEN_EXP'),
          algorithm: 'RS256'
        },
        global: true
      }),
      inject: [ConfigService]
    }),
    UserModule,
    PassportModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
