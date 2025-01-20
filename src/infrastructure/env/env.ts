import { type Static, Type } from '@sinclair/typebox';

const NodeEnvSchema: Record<string, string> = {
  development: 'development',
  test: 'test',
  production: 'production'
};

export const envSchema = Type.Object({
  NODE_ENV: Type.Enum(NodeEnvSchema),
  APP_NAME: Type.String(),
  LOG_LEVEL: Type.String(),
  API_HOST: Type.String(),
  API_PORT: Type.Number(),
  MONGO_URL: Type.String(),
  ISS: Type.String({ default: 'ecomm-starter' }),
  AUD: Type.String({ default: 'ecomm-auth' })
});
export type Env = Static<typeof envSchema>;
