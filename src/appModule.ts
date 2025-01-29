import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './modules/project/projectModule';
import { UserModule } from './modules/user/userModule';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth/authModule';
import { OrgModule } from './modules/org/orgModule';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from './infrastructure/db/dbModule';
import { ApiClientModule } from './modules/apiclient/apiClientModule';

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
    paths: ['password', '*.password', 'clientSecret', '*.clientSecret'],
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
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true }
    }),
    DatabaseModule,
    AuthModule,
    ApiClientModule,
    UserModule,
    OrgModule,
    ProjectModule
  ],
  exports: [DatabaseModule]
})
export class AppModule {}
