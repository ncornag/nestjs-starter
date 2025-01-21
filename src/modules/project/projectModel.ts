import { Type, type Static } from '@sinclair/typebox';
import { AuditFields, idSchema } from 'src/appModule.interfaces';

export const ProjectState = {
  ONLINE: 'online',
  OFFLINE: 'offline'
} as const;
export const ProjectStateSchema = Type.Enum(ProjectState, { default: ProjectState.OFFLINE });

export const ProjectModelSchema = Type.Object(
  {
    id: idSchema,
    orgId: idSchema,
    ownerId: idSchema,
    key: Type.String({ pattern: '^[A-Za-z0-9]{3,25}$' }),
    description: Type.Optional(Type.String({ maxLength: 255 })),
    state: ProjectStateSchema,
    ...AuditFields
  },
  { additionalProperties: false }
);
export type ProjectModel = Static<typeof ProjectModelSchema>;
