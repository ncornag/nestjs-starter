import { Type, type Static } from '@sinclair/typebox';

export const apiClientIdSchema = Type.String({ pattern: '^[A-Za-z0-9_-]{16,64}$' });
export type ApiClientId = Static<typeof apiClientIdSchema>;

export const ApiClientModelSchema = Type.Object({
  id: apiClientIdSchema,
  clientSecret: Type.String(),
  name: Type.String(),
  projectKey: Type.String(),
  scopes: Type.Array(Type.String()),
  isActive: Type.Boolean()
});
export type ApiClientModel = Static<typeof ApiClientModelSchema>;
