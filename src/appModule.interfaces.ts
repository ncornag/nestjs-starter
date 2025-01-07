import { Type, type Static } from '@sinclair/typebox';

// ID TYPES
export const idSchema = Type.String();
export type ID = Static<typeof idSchema>;

// GENERIC SERVICE
export interface IService<T, C, U> {
  create: (data: C) => Promise<ID>;
  findById: (id: ID) => Promise<T>;
  update: (is: ID, data: U) => Promise<T>;
  delete: (id: ID) => Promise<void>;
}

// GENERIC REPOSITORY
export interface IRepository<T> {
  create(input: T): Promise<void>;
  findById(id: string): Promise<T>;
  update(is: string, input: T): Promise<T>;
  delete(id: string): Promise<void>;
}
