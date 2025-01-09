import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule, loggerConfig } from './appModule';
import { configureNestJsTypebox } from 'nestjs-typebox';
import fastifyRequestLogger from '@mgcrea/fastify-request-logger';
import { ConfigService } from '@nestjs/config';
import { yellow } from 'kolorist';
import helmet from 'helmet';

import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet(
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict',
  5
);

configureNestJsTypebox({
  patchSwagger: true,
  setFormats: true
});

const FastifyModule = new FastifyAdapter({
  logger: loggerConfig,
  disableRequestLogging: true,
  genReqId: (req) => (req.headers['request-id'] as string) ?? nanoid(5)
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    FastifyModule,
    {
      bufferLogs: true
    }
  );
  await app.register(fastifyRequestLogger);
  const configService = app.get(ConfigService);
  const appLogger = app.get(Logger);
  app.useLogger(appLogger);

  app.use(
    helmet({
      xPoweredBy: false
    })
  );
  app.use(helmet.hidePoweredBy());
  app.enableCors();
  const API_HOST = configService.get<string>('API_HOST', '0.0.0.0');
  const API_PORT = configService.get<number>('API_PORT', 3000);
  await app.listen(API_PORT, API_HOST);

  appLogger.log(
    `${yellow('APP:')} [${configService.get<string>('APP_NAME')}] ${yellow('ENV:')} [${configService.get<string>('NODE_ENV')}] ${yellow('LOG:')} [${configService.get<string>('LOG_LEVEL')}]`
  );
}
bootstrap();
