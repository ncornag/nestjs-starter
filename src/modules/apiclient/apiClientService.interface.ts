import { Type, type Static } from '@sinclair/typebox';
import { ApiClientModel, ApiClientModelSchema } from './apiclientModel';
import { IDWithVersion } from 'src/appModule.interfaces';

export const _IApiClientService = 'IApiClientService';

// CREATE
export const CreateApiClientBodySchema = Type.Omit(ApiClientModelSchema, ['id'], {
  additionalProperties: false
});
export type CreateApiClientBody = Static<typeof CreateApiClientBodySchema>;

// INTERFACE
export interface IApiClientService {
  create(data: CreateApiClientBody): Promise<IDWithVersion>;
  findByClientId(clientId: string): Promise<ApiClientModel | null>;
}
