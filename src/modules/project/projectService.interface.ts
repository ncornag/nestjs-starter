import { Type, type Static } from '@sinclair/typebox';
import { ID, IService } from 'src/appModule.interfaces';
import { ProjectModel, ProjectModelSchema } from './projectModel';

export const PROJECT_SERVICE_TOKEN = 'PROJECT_SERVICE_TOKEN';

// SCHEMAS
export const CreateProjectSchema = Type.Omit(ProjectModelSchema, ['id'], {
  additionalProperties: false
});
export type CreateProject = Static<typeof CreateProjectSchema>;
export const UpdateProjectSchema = Type.Partial(
  Type.Omit(ProjectModelSchema, ['id']),
  {
    additionalProperties: false
  }
);
export type UpdateProject = Static<typeof UpdateProjectSchema>;

// INTERFACE
export interface IProjectService
  extends IService<ProjectModel, CreateProject, UpdateProject> {}
