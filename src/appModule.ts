import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/projectModule';
import { DatabaseModule } from './infrastructure/databaseModule';
import { LoggerModule } from 'nestjs-pino';
import { RequestContextModule } from 'nestjs-request-context';
import { SetMetadata } from '@nestjs/common';
import { AuthModule } from './modules/auth/authModule';

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
    ConfigModule.forRoot({
      isGlobal: true
    }),
    LoggerModule.forRoot({
      useExisting: true,
      pinoHttp: loggerConfig
    }),
    DatabaseModule,
    RequestContextModule,
    AuthModule,
    ProjectModule
  ],
  exports: [DatabaseModule]
})
export class AppModule {}
