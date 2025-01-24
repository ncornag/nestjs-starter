import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OrgModel } from './orgModel';
import { IOrgRepository, _IOrgRepository } from './orgRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID, IDWithVersion } from 'src/appModule.interfaces';
import { type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/db/dbModule';
import { IDbService } from 'src/infrastructure/db/dbService.interface';
import { mongoDiff } from 'src/infrastructure/db/mongoDiff';
import { DbService } from 'src/infrastructure/db/dbService';

@Injectable()
export class OrgRepository implements IOrgRepository {
  private col: Collection<DbEntity<OrgModel>>;

  constructor(
    @Inject('DbService')
    private db: DbService
  ) {}

  public async onModuleInit() {
    this.col = this.db.getDb().collection<DbEntity<OrgModel>>('orgs');
  }

  // CREATE
  async create(input: OrgModel): Promise<Result<IDWithVersion, Error>> {
    const result = await this.col.insertOne(toDbEntity<OrgModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok({ id: result.insertedId, version: 0 });
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
    const { ops, updated } = mongoDiff(dbEntity, data);
    if (!ops) return Ok(toEntity<OrgModel>(updated));
    const updateResult = await this.col.updateOne(toDbEntity<OrgModel>(where), ops);
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(toEntity<OrgModel>({ ...updated, version: updated.version + 1 }));
  }

  // DELETE
  async deleteOne(where: any): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne(toDbEntity<OrgModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }

  // ADD PROJECT
  async addProject(orgId: ID, projectId: ID): Promise<Result<undefined, Error>> {
    const updateResult = await this.col.updateOne(
      { _id: orgId, version: { $gte: 0 } },
      { $push: { projects: projectId } }
    );
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return new Ok(undefined);
  }

  // REMOVE PROJECT
  async removeProject(orgId: ID, projectId: ID): Promise<Result<undefined, Error>> {
    const updateResult = await this.col.updateOne(
      { _id: orgId },
      { $pull: { projects: projectId } }
    );
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return new Ok(undefined);
  }
}
