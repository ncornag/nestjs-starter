import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from './appModule';
import { configureNestJsTypebox } from 'nestjs-typebox';
import fastifyRequestLogger from '@mgcrea/fastify-request-logger';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

configureNestJsTypebox({
  patchSwagger: true,
  setFormats: true
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: {
          target: '@mgcrea/pino-pretty-compact',
          options: {
            translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            colorize: true,
            ignore: 'pid,hostname,plugin'
          }
        }
      },
      disableRequestLogging: true
    })
  );
  await app.register(fastifyRequestLogger);

  const configService = app.get(ConfigService);
  const API_HOST = configService.get<string>('API_HOST', '0.0.0.0');
  const API_PORT = configService.get<number>('API_PORT', 3000);
  await app.listen(API_PORT, API_HOST);
  //const logger = new Logger();
  Logger.log(
    `This application is runnning on: ${await app.getUrl()}`,
    'Bootstrap'
  );
}
bootstrap();
