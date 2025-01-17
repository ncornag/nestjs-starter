import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/databaseModule';
import { UserService } from './userService';
import { _IUserService } from './userService.interface';
import { UserRepository } from './userRepository';
import { _IUserRepository } from './userRepository.interface';

@Module({
  imports: [DatabaseModule],
  providers: [
    UserService,
    {
      provide: _IUserService,
      useClass: UserService
    },
    {
      provide: _IUserRepository,
      useClass: UserRepository
    }
  ],
  exports: [UserService]
})
export class UserModule {}
