import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/projectModule';
import { DatabaseModule } from './databaseModule';
import { LoggerModule } from 'nestjs-pino';

export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: '@mgcrea/pino-pretty-compact',
    options: {
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      colorize: true,
      ignore: 'pid,hostname,plugin'
    }
  }
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      useExisting: true,
      pinoHttp: loggerConfig
    }),
    ProjectModule,
    DatabaseModule
  ],
  exports: [DatabaseModule]
})
export class AppModule {}
