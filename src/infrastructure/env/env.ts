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
  TOKEN_ISS: Type.String({ default: 'ecomm-starter' }),
  TOKEN_AUD: Type.String({ default: 'ecomm-auth' }),
  TOKEN_EXP: Type.Number(),
  PASSWORD_SALT_ROUNDS: Type.Number({ default: 10 })
});
export type Env = Static<typeof envSchema>;
