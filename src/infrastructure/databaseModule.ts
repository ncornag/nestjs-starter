import { Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { green, yellow } from 'kolorist';
import { PinoLogger } from 'nestjs-pino';
import { EnvService } from './env/envService';
import { EnvModule } from './env/envModule';

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: 'DB',
      inject: [EnvService, PinoLogger],
      useFactory: async (config: EnvService, logger): Promise<MongoClient> => {
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
