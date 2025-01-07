import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { AppModule } from './appModule';
import { configureNestJsTypebox } from 'nestjs-typebox';
import fastifyRequestLogger from '@mgcrea/fastify-request-logger';

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
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
