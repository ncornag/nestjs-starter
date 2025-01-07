import { Type, type Static } from '@sinclair/typebox';

export const ProjectState = {
  ONLINE: 'online',
  OFFLINE: 'offline'
} as const;
export const ProjectStateSchema = Type.Enum(ProjectState);

export const ProjectModelSchema = Type.Object({
  id: Type.String(),
  key: Type.String({ pattern: '^[A-Za-z0-9]{3,25}$' }),
  description: Type.Optional(Type.String({ maxLength: 255 })),
  state: ProjectStateSchema
});
export type ProjectModel = Static<typeof ProjectModelSchema>;
