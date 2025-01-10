import { Type, type Static } from '@sinclair/typebox';
import { idSchema, IService } from 'src/appModule.interfaces';
import { ProjectModel, ProjectModelSchema } from './projectModel';

export const PROJECT_SERVICE_TOKEN = 'PROJECT_SERVICE_TOKEN';

// PROJECT BASED PARAMS
export const ProjectBasedParamsSchema = Type.Object({
  projectId: Type.String()
});
export type ProjectBasedParams = Static<typeof ProjectBasedParamsSchema>;

// RESPONSE
export const ProjectResponseSchema = ProjectModelSchema;
export type ProjectResponse = Static<typeof ProjectResponseSchema>;

// CREATE
export const CreateProjectBodySchema = Type.Omit(ProjectModelSchema, ['id'], {
  additionalProperties: false
});
export type CreateProjectBody = Static<typeof CreateProjectBodySchema>;

// UPDATE
export const UpdateProjectBodySchema = Type.Partial(
  Type.Omit(ProjectModelSchema, ['id', 'key']),
  {
    additionalProperties: false
  }
);
export type UpdateProjectBody = Static<typeof UpdateProjectBodySchema>;

export const UpdateProjectParamsSchema = Type.String();
export type UpdateProjectParams = Static<typeof UpdateProjectParamsSchema>;

// INTERFACE
export interface IProjectService
  extends IService<ProjectModel, CreateProjectBody, UpdateProjectBody> {}
