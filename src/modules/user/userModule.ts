import { Module } from '@nestjs/common';
import { UserService } from './userService';
import { _IUserService } from './userService.interface';
import { UserRepository } from './userRepository';
import { _IUserRepository } from './userRepository.interface';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: _IUserService,
      useClass: UserService
    },
    {
      provide: _IUserRepository,
      useClass: UserRepository
    }
  ],
  exports: [_IUserService]
})
export class UserModule {}
