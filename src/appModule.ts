import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';
import { ProjectModule } from './modules/project/projectModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ProjectModule
  ]
})
export class AppModule {}
