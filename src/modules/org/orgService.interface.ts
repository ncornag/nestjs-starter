import { Type, type Static } from '@sinclair/typebox';
import { ID, IService } from 'src/appModule.interfaces';
import { OrgModel, OrgModelSchema } from './orgModel';

export const _IOrgService = 'IOrgService';

// RESPONSE
export const OrgResponseSchema = OrgModelSchema;
export type OrgResponse = Static<typeof OrgResponseSchema>;

// CREATE
export const CreateOrgBodySchema = Type.Omit(
  OrgModelSchema,
  ['id', 'ownerId', 'version', 'projects'],
  {
    additionalProperties: false
  }
);
export type CreateOrgBody = Static<typeof CreateOrgBodySchema>;

// UPDATE
export const UpdateOrgBodySchema = Type.Partial(
  Type.Omit(OrgModelSchema, ['id', 'ownerId', 'version', 'projects']),
  {
    additionalProperties: false
  }
);
export type UpdateOrgBody = Static<typeof UpdateOrgBodySchema>;

export const UpdateOrgParamsSchema = Type.String();
export type UpdateOrgParams = Static<typeof UpdateOrgParamsSchema>;

// INTERFACE
export interface IOrgService extends IService<OrgModel, CreateOrgBody, UpdateOrgBody> {
  addProject(orgId: ID, projectId: ID): Promise<void>;
  removeProject(orgId: ID, projectId: ID): Promise<void>;
}
