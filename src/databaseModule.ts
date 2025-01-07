import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (): Promise<MongoClient> => {
        try {
          return await MongoClient.connect(
            'mongodb://127.0.0.1/ecomm-nestjs',
            {}
          );
        } catch (e) {
          throw e;
        }
      }
    }
  ],
  exports: ['DATABASE_CONNECTION']
})
export class DatabaseModule {}
