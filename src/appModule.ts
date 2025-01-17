import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/projectModule';
import { UserModule } from './modules/user/userModule';
import { DatabaseModule } from './infrastructure/databaseModule';
import { LoggerModule } from 'nestjs-pino';
import { RequestContextModule } from 'nestjs-request-context';
import { AuthModule } from './modules/auth/authModule';
import { OrgModule } from './modules/org/orgModule';

export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: '@mgcrea/pino-pretty-compact',
    options: {
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      colorize: true,
      ignore: 'pid,hostname,plugin'
    }
  },
  redact: {
    paths: ['password', '*.password'],
    censor: '***'
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
    UserModule,
    OrgModule,
    ProjectModule
  ],
  exports: [DatabaseModule]
})
export class AppModule {}
