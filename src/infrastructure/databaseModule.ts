import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { green, yellow } from 'kolorist';
import { PinoLogger } from 'nestjs-pino';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DB',
      inject: [ConfigService, PinoLogger],
      useFactory: async (
        config: ConfigService,
        logger
      ): Promise<MongoClient> => {
        try {
          const url = config.get('MONGO_URL');
          const client = await MongoClient.connect(url, {});
          logger.info(`${yellow('MongoDB')} ${green('starting in')} [${url}]`);
          return client;
        } catch (e) {
          throw e;
        }
      }
    }
  ],
  exports: ['DB']
})
export class DatabaseModule {}
