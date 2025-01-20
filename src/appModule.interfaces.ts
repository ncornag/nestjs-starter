import { Type, type Static } from '@sinclair/typebox';
import { Result } from 'ts-results-es';

// ID TYPES
export const idSchema = Type.String();
export type ID = Static<typeof idSchema>;
export const projectIdSchema = Type.String();
export type ProjectID = Static<typeof projectIdSchema>;

// GENERIC SERVICE
export interface IService<T, C, U> {
  create: (data: C) => Promise<ID>;
  findById: (id: ID) => Promise<T>;
  update: (id: ID, data: U) => Promise<T>;
  delete: (id: ID) => Promise<void>;
}

// GENERIC REPOSITORY
export interface IRepository<T> {
  create(input: T): Promise<Result<ID, Error>>;
  find(where: any): Promise<Result<T[] | undefined, Error>>;
  updateOne(where: any, input: Partial<T>): Promise<Result<T, Error>>;
  deleteOne(where: any): Promise<Result<void, Error>>;
}

// PROJECT BASED PARAMS
export const ProjectBasedParamsSchema = Type.Object({
  projectId: Type.String()
});
export type ProjectBasedParams = Static<typeof ProjectBasedParamsSchema>;
