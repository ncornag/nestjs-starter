import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../user/userModule';
import { AuthService } from './authService';
import { AuthController } from './authController';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: '',
      signOptions: { expiresIn: '60s' }
    })
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
