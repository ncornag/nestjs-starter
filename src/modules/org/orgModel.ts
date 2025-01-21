import { Type, type Static } from '@sinclair/typebox';
import { AuditFields, idSchema } from 'src/appModule.interfaces';

export const OrgModelSchema = Type.Object({
  id: idSchema,
  name: Type.Optional(Type.String({ maxLength: 255 })),
  ownerId: idSchema,
  projects: Type.Optional(Type.Array(idSchema, { default: [] })),
  ...AuditFields
});
export type OrgModel = Static<typeof OrgModelSchema>;
