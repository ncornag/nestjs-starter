import { ID, IRepository } from 'src/appModule.interfaces';
import { UserModel } from './userModel';
import { Result } from 'ts-results-es';

export const _IUserRepository = 'IUserRepository';

export interface IUserRepository extends IRepository<UserModel> {
  findByUsername(
    username: string
  ): Promise<Result<UserModel | undefined, Error>>;
}
