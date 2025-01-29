import { Type, type Static } from '@sinclair/typebox';
import { idSchema } from 'src/appModule.interfaces';

export const ApiClientModelSchema = Type.Object({
  id: idSchema,
  clientId: Type.String({ pattern: '^[A-Za-z0-9_-]{16,64}$' }),
  clientSecret: Type.String(),
  name: Type.String(),
  scopes: Type.Array(Type.String()),
  isActive: Type.Boolean()
});
export type ApiClientModel = Static<typeof ApiClientModelSchema>;
