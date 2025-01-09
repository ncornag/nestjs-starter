import { Module } from '@nestjs/common';
import { EnvService } from './envService';
import { envSchema } from './env';
import { ConfigModule } from '@nestjs/config';
import { Value } from '@sinclair/typebox/value';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env'
          : `${process.env.NODE_ENV}.env`,
      validate: (env) => Value.Parse(envSchema, env),
      isGlobal: false
    })
  ],
  providers: [EnvService],
  exports: [EnvService]
})
export class EnvModule {}
