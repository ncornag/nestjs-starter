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
    JwtModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          privateKey: fs.readFileSync(config.get<string>('PRIVATE_KEY_FILE'), 'ascii'),
          signOptions: {
            expiresIn: '365d',
            algorithm: 'RS256'
          },
          global: true
        };
      },
      inject: [ConfigService]
    }),
    UserModule,
    PassportModule
  ],
  providers: [AuthService, LocalStrategy, JwtService, JwtStrategy, ConfigService],
  controllers: [AuthController],
  exports: [AuthService, JwtService]
})
export class AuthModule {}
