import { ID, IRepository } from 'src/appModule.interfaces';
import { ProjectModel } from './projectModel';
import { Result } from 'ts-results-es';

export const PROJECT_REPOSITORY_TOKEN = 'PROJECT_REPOSITORY_TOKEN';

export interface IProjectRepository extends IRepository<ProjectModel> {
  findByKey(key: ID): Promise<Result<ProjectModel | undefined, Error>>;
}
