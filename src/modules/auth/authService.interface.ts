import { Type, type Static } from '@sinclair/typebox';
import { ApiClientModelSchema } from '../apiclient/apiclientModel';
import { CreateUserBody } from '../user/userService.interface';
import { IDWithVersion } from 'src/appModule.interfaces';

export const _IAuthService = 'IAuthService';

// RESPONSE
export const ApiClientCreateResponseSchema = Type.Omit(ApiClientModelSchema, [], {
  additionalProperties: false
});
export type ApiClientCreateResponse = Static<typeof ApiClientCreateResponseSchema>;

export const ApiClientResponseSchema = Type.Omit(ApiClientModelSchema, ['clientSecret'], {
  additionalProperties: false
});
export type ApiClientResponse = Static<typeof ApiClientResponseSchema>;

// CREATE
export const CreateApiClientBodySchema = Type.Omit(
  ApiClientModelSchema,
  ['id', 'clientId', 'clientSecret', 'isActive'],
  {
    additionalProperties: false
  }
);
export type CreateApiClientBody = Static<typeof CreateApiClientBodySchema>;

// INTERFACE
export interface IAuthService {
  validateUser(username: string, incommingPassword: string): Promise<any | null>;
  signUp(data: CreateUserBody): Promise<IDWithVersion>;
  login(user: any): Promise<{ access_token: string }>;
  createApiClient(data: CreateApiClientBody): Promise<ApiClientCreateResponse>;
  validateApiClient(
    clientId: string,
    incommingClientSecret: string
  ): Promise<ApiClientResponse | null>;
}
