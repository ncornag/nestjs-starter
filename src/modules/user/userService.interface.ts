import { Type, type Static } from '@sinclair/typebox';
import { IService } from 'src/appModule.interfaces';
import { UserModel, UserModelSchema } from './userModel';

export const _IUserService = 'IUserService';

// RESPONSE
export const UserResponseSchema = Type.Omit(UserModelSchema, ['password'], {
  additionalProperties: false
});
export type UserResponse = Static<typeof UserResponseSchema>;

// CREATE
export const CreateUserBodySchema = Type.Omit(UserModelSchema, ['id'], {
  additionalProperties: false
});
export type CreateUserBody = Static<typeof CreateUserBodySchema>;

// UPDATE
export const UpdateUserBodySchema = Type.Partial(
  Type.Omit(UserModelSchema, ['id', 'username']),
  {
    additionalProperties: false
  }
);
export type UpdateUserBody = Static<typeof UpdateUserBodySchema>;

export const UpdateUserParamsSchema = Type.String();
export type UpdateUserParams = Static<typeof UpdateUserParamsSchema>;

// INTERFACE
export interface IUserService
  extends IService<UserModel, CreateUserBody, UpdateUserBody> {
  findByUsername(username: string): Promise<UserModel | undefined>;
}
