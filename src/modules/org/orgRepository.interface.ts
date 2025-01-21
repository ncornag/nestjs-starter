import { ID, IRepository } from 'src/appModule.interfaces';
import { OrgModel } from './orgModel';
import { Result } from 'ts-results-es';

export const _IOrgRepository = 'IOrgRepository';

export interface IOrgRepository extends IRepository<OrgModel> {
  addProject(orgId: ID, projectId: ID): Promise<Result<undefined, Error>>;
  removeProject(orgId: ID, projectId: ID): Promise<Result<undefined, Error>>;
}
