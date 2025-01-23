import { MongoClient, Db, Collection } from 'mongodb';

export interface IDbService {
  client: MongoClient;
  getDb: (projectId?: string) => Db;
  getCol: <T>(projectId: string, entity: string, catalogId?: string) => Collection<T>;
  colName: (projectId: string, entity: string, catalogId?: string) => string;
}
