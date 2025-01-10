import { Type, type Static } from '@sinclair/typebox';
import { Option, Result } from 'ts-results-es';

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
  findById(id: string): Promise<Result<T | undefined, Error>>;
  update(is: string, input: Partial<T>): Promise<Result<T, Error>>;
  delete(id: string): Promise<Result<void, Error>>;
}
