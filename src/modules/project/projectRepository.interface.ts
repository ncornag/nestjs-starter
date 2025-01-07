import { IRepository } from 'src/appModule.interfaces';
import { ProjectModel } from './projectModel';

export const PROJECT_REPOSITORY_TOKEN = 'PROJECT_REPOSITORY_TOKEN';

export interface IProjectRepository extends IRepository<ProjectModel> {
  findByKey(key: string): Promise<ProjectModel>;
}
