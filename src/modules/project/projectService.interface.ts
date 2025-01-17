import { Type, type Static } from '@sinclair/typebox';
import { IService } from 'src/appModule.interfaces';
import { ProjectModel, ProjectModelSchema } from './projectModel';

export const _IProjectService = 'IProjectService';

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
  extends IService<ProjectModel, CreateProjectBody, UpdateProjectBody> {
  findByKey(key: string): Promise<ProjectModel | undefined>;
}
