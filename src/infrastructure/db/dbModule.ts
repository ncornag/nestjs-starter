import { Module } from '@nestjs/common';
import { EnvModule } from '../env/envModule';
import { ID } from 'src/appModule.interfaces';
import { DbService } from './dbService';
import { configureNestJsTypebox } from 'nestjs-typebox';

configureNestJsTypebox({
  patchSwagger: true,
  setFormats: true
});

export type Entity = {
  id: ID;
  [key: string]: any;
};

export type DbEntity<T extends Entity> = Omit<T, 'id'> & {
  _id?: T['id'];
};

export const toEntity = <T extends Entity>(dbEntity: DbEntity<T>): T | undefined => {
  if (dbEntity == undefined) return undefined;
  const { _id, ...remainder } = dbEntity;
  return {
    id: _id,
    ...remainder
  } as T;
};

export const toDbEntity = <T extends Entity>({ id, ...remainder }): DbEntity<T> =>
  Object.assign(remainder, id && { _id: id }) as DbEntity<T>;

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: 'DbService',
      useClass: DbService
    }
  ],
  exports: ['DbService']
})
export class DatabaseModule {}
