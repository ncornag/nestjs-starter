import { Type, type Static } from '@sinclair/typebox';
import { idSchema } from 'src/appModule.interfaces';

export const UserModelSchema = Type.Object({
  id: idSchema,
  username: Type.String({ pattern: '^[A-Za-z0-9]{3,25}$' }),
  password: Type.String(),
  roles: Type.Array(Type.String())
});
export type UserModel = Static<typeof UserModelSchema>;
