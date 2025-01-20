import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrgModel } from './orgModel';
import { IOrgRepository, _IOrgRepository } from './orgRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID } from 'src/appModule.interfaces';
import { DB, type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/databaseModule';

@Injectable()
export class OrgRepository implements IOrgRepository {
  private col: Collection<DbEntity<OrgModel>>;

  constructor(
    @Inject('DB')
    private db: DB
  ) {
    this.col = this.db.getDb().collection<DbEntity<OrgModel>>('orgs');
  }

  // CREATE
  async create(input: OrgModel): Promise<Result<ID, Error>> {
    const result = await this.col.insertOne(toDbEntity<OrgModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok(result.insertedId);
  }

  // FIND
  async find(where: any): Promise<Result<OrgModel[] | undefined, Error>> {
    const dbEntities = await this.col.find(toDbEntity<OrgModel>(where)).toArray();
    return Ok(dbEntities.map((dbEntity) => toEntity<OrgModel>(dbEntity)));
  }

  // UPDATE
  async updateOne(where: any, data: Partial<OrgModel>): Promise<Result<OrgModel, Error>> {
    const dbEntity = await this.col.findOne(toDbEntity<OrgModel>(where));
    if (!dbEntity) throw new NotFoundException('Org not found');
    const toUpdateDbEntity = Object.assign(dbEntity, data);
    const updateResult = await this.col.replaceOne(
      toDbEntity<OrgModel>(where),
      toUpdateDbEntity
    );
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(toEntity<OrgModel>(toUpdateDbEntity));
  }

  // DELETE
  async deleteOne(where: any): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne(toDbEntity<OrgModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }
}
