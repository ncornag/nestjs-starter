import { Module } from '@nestjs/common';
import { UsersService } from './userService';

@Module({
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
