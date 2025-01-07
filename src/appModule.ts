import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/projectModule';
import { DatabaseModule } from './databaseModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ProjectModule,
    DatabaseModule
  ],
  exports: [DatabaseModule]
})
export class AppModule {}
