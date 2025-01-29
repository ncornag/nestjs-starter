import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectModel } from './projectModel';
import { IProjectRepository, _IProjectRepository } from './projectRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { IDWithVersion } from 'src/appModule.interfaces';
import { type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/db/dbModule';
import { mongoDiff } from 'src/infrastructure/db/mongoDiff';
import { DbService } from 'src/infrastructure/db/dbService';
import { ProjectNotFoundException } from './projectExceptions';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  private col: Collection<DbEntity<ProjectModel>>;

  constructor(
    @Inject('DbService')
    private db: DbService
  ) {}

  public async onModuleInit() {
    this.col = this.db.getDb().collection<DbEntity<ProjectModel>>('projects');
  }

  // CREATE
  async create(input: ProjectModel): Promise<Result<IDWithVersion, Error>> {
    const result = await this.col.insertOne(toDbEntity<ProjectModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok({ id: result.insertedId, version: 0 });
  }

  // FIND
  async find(where: any): Promise<Result<ProjectModel[] | undefined, Error>> {
    const dbEntities = await this.col.find(toDbEntity<ProjectModel>(where)).toArray();
    return Ok(dbEntities.map((dbEntity) => toEntity<ProjectModel>(dbEntity)));
  }

  // UPDATE
  async updateOne(
    where: any,
    data: Partial<ProjectModel>
  ): Promise<Result<ProjectModel, Error>> {
    const dbEntity = await this.col.findOne(toDbEntity<ProjectModel>(where));
    if (!dbEntity) throw new ProjectNotFoundException();
    const { ops, updated } = mongoDiff(dbEntity, data);
    if (!ops) return Ok(toEntity<ProjectModel>(dbEntity));
    const updateResult = await this.col.updateOne(toDbEntity<ProjectModel>(where), ops);
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(toEntity<ProjectModel>({ ...updated, version: updated.version + 1 }));
  }

  // DELETE
  async deleteOne(where: any): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne(toDbEntity<ProjectModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }

  // AGGREGATE
  async aggregate(pipeline: any[], options?: any): Promise<Result<any[], Error>> {
    const result = await this.col.aggregate(pipeline, options).toArray();
    return Ok(result);
  }
}
