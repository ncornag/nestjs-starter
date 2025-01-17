import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrgModel } from './orgModel';
import { IOrgRepository, _IOrgRepository } from './orgRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID } from 'src/appModule.interfaces';
import { DB, type DbEntity } from 'src/infrastructure/databaseModule';

@Injectable()
export class OrgRepository implements IOrgRepository {
  private col: Collection<DbEntity<OrgModel>>;

  constructor(
    @Inject('DB')
    private db: DB
  ) {
    this.col = this.db.getDb().collection<DbEntity<OrgModel>>('orgs');
  }

  private toEntity = (dbEntity: DbEntity<OrgModel>): OrgModel | undefined => {
    if (dbEntity == undefined) return undefined;
    const { _id, ...remainder } = dbEntity;
    return {
      id: _id,
      ...remainder
    };
  };
  private toDbEntity = ({
    id,
    ...remainder
  }: OrgModel): DbEntity<OrgModel> => ({
    _id: id,
    ...remainder
  });

  // CREATE
  async create(input: OrgModel): Promise<Result<ID, Error>> {
    const result = await this.col.insertOne(this.toDbEntity(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok(result.insertedId);
  }

  // FIND
  async findById(id: string): Promise<Result<OrgModel | undefined, Error>> {
    const dbEntity = await this.col.findOne({ _id: id });
    return Ok(this.toEntity(dbEntity));
  }

  // UPDATE
  async update(
    id: string,
    data: Partial<OrgModel>
  ): Promise<Result<OrgModel, Error>> {
    const dbEntity = await this.col.findOne({ _id: id });
    if (!dbEntity) throw new NotFoundException('Org not found');
    const toUpdateDbEntity = Object.assign(dbEntity, data);
    const updateResult = await this.col.replaceOne(
      { _id: id },
      toUpdateDbEntity
    );
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(this.toEntity(toUpdateDbEntity));
  }

  // DELETE
  async delete(id: string): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne({ _id: id });
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }
}
