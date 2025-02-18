import { ID, IRepository } from 'src/appModule.interfaces';
import { ProjectModel } from './projectModel';
import { Result } from 'ts-results-es';

export const _IProjectRepository = 'IProjectRepository';

export interface IProjectRepository extends IRepository<ProjectModel> {
  aggregate(pipeline: any[], options: any): Promise<Result<any[], Error>>;
}
