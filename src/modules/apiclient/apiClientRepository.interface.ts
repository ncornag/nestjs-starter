import { IRepository } from 'src/appModule.interfaces';
import { ApiClientModel } from './apiclientModel';

export const _IApiClientRepository = 'IApiClientRepository';

export interface IApiClientRepository extends IRepository<ApiClientModel> {}
