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
import { yellow } from 'kolorist';
import helmet from 'helmet';

import { customAlphabet } from 'nanoid';
import { SwaggerRunner } from './shared/swagger/swagger-runner';
import { EnvService } from './infrastructure/env/envService';
const nanoid = customAlphabet(
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict',
  5
);

// Patch Bigint.toJSON
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BigInt {
  toJSON: () => string;
}
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

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
  app.setGlobalPrefix('api');
  await app.register(fastifyRequestLogger);
  const envService = app.get(EnvService);
  const appLogger = app.get(Logger);
  app.useLogger(appLogger);

  app.use(
    helmet({
      xPoweredBy: false
    })
  );
  app.use(helmet.hidePoweredBy());
  app.enableCors();

  new SwaggerRunner(app).run();

  const API_HOST = envService.get('API_HOST');
  const API_PORT = envService.get('API_PORT');
  await app.listen(API_PORT, API_HOST);

  appLogger.log(
    `${yellow('APP:')} [${envService.get('APP_NAME')}] ${yellow('ENV:')} [${envService.get('NODE_ENV')}] ${yellow('LOG:')} [${envService.get('LOG_LEVEL')}]`
  );
}
bootstrap();
