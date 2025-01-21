import { Type, type Static } from '@sinclair/typebox';
import { Result } from 'ts-results-es';

// AUDIT FIELDS
export const AuditFields = {
  version: Type.Optional(Type.Number({ default: 0 })),
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  lastModifiedAt: Type.Optional(Type.String({ format: 'date-time' }))
};

// ID TYPES
export const idSchema = Type.String();
export type ID = Static<typeof idSchema>;
export const versionSchema = AuditFields.version;
export type Version = Static<typeof versionSchema>;
export const projectIdSchema = Type.String();
export type ProjectID = Static<typeof projectIdSchema>;
export const IDWithVersionSchema = Type.Object({
  id: idSchema,
  version: versionSchema
});
export type IDWithVersion = Static<typeof IDWithVersionSchema>;

// GENERIC SERVICE
export interface IService<T, C, U> {
  create: (data: C) => Promise<IDWithVersion>;
  findById: (id: ID) => Promise<T>;
  update: (id: ID, version: Version, data: U) => Promise<T>;
  delete: (id: ID) => Promise<void>;
}

// GENERIC REPOSITORY
export interface IRepository<T> {
  create(input: T): Promise<Result<IDWithVersion, Error>>;
  find(where: any): Promise<Result<T[] | undefined, Error>>;
  updateOne(where: any, input: Partial<T>): Promise<Result<T, Error>>;
  deleteOne(where: any): Promise<Result<void, Error>>;
}

// PROJECT BASED PARAMS
export const ProjectBasedParamsSchema = Type.Object({
  projectId: Type.String()
});
export type ProjectBasedParams = Static<typeof ProjectBasedParamsSchema>;
