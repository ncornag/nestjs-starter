import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectModel } from './projectModel';
import { IProjectRepository, _IProjectRepository } from './projectRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID } from 'src/appModule.interfaces';
import { DB, type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/databaseModule';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  private col: Collection<DbEntity<ProjectModel>>;

  constructor(
    @Inject('DB')
    private db: DB
  ) {
    this.col = this.db.getDb().collection<DbEntity<ProjectModel>>('projects');
  }

  // CREATE
  async create(input: ProjectModel): Promise<Result<ID, Error>> {
    const result = await this.col.insertOne(toDbEntity<ProjectModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok(result.insertedId);
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
    if (!dbEntity) throw new NotFoundException('Project not found');
    const toUpdateDbEntity = Object.assign(dbEntity, data);
    const updateResult = await this.col.replaceOne(
      toDbEntity<ProjectModel>(where),
      toUpdateDbEntity
    );
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(toEntity<ProjectModel>(toUpdateDbEntity));
  }

  // DELETE
  async deleteOne(where: any): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne(toDbEntity<ProjectModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }
}
