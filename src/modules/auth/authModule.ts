import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/userModule';
import { AuthService } from './authService';
import { AuthController } from './authController';
import { LocalStrategy } from './localStrategy';
import { JwtStrategy } from './jwtAuthStrategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiClientModule } from '../apiclient/apiClientModule';
import { ApiClientController } from '../apiclient/apiClientController';

@Module({
  imports: [
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
    ApiClientModule,
    PassportModule
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController, ApiClientController],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
