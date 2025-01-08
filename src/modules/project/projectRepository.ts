import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ProjectModel } from './projectModel';
import { IProjectRepository } from './projectRepository.interface';
import { Collection, Db, MongoClient } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID } from 'src/appModule.interfaces';

type DbEntity = Omit<ProjectModel, 'id'> & {
  _id?: ProjectModel['id'];
};

@Injectable()
export class ProjectRepository implements IProjectRepository {
  private col: Collection<DbEntity>;

  constructor(
    @Inject('DB')
    private mongo: MongoClient
  ) {
    this.col = this.mongo.db().collection<DbEntity>('project');
  }

  private toEntity = (dbEntity: DbEntity): ProjectModel | undefined => {
    if (dbEntity == undefined) return undefined;
    const { _id, ...remainder } = dbEntity;
    return {
      id: _id,
      ...remainder
    };
  };
  private toDbEntity = ({ id, ...remainder }: ProjectModel): DbEntity => ({
    _id: id,
    ...remainder
  });

  // CREATE
  async create(input: ProjectModel): Promise<Result<ID, Error>> {
    const result = await this.col.insertOne(this.toDbEntity(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok(result.insertedId);
  }

  // FIND
  async findById(id: string): Promise<Result<ProjectModel | undefined, Error>> {
    const dbEntity = await this.col.findOne({ _id: id });
    return Ok(this.toEntity(dbEntity));
  }

  // UPDATE
  async update(
    id: string,
    data: Partial<ProjectModel>
  ): Promise<Result<ProjectModel, Error>> {
    const dbEntity = await this.col.findOne({ _id: id });
    if (!dbEntity) throw new NotFoundException('Project not found');
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

  // FIND BY KEY
  async findByKey(
    key: string
  ): Promise<Result<ProjectModel | undefined, Error>> {
    const dbEntity = await this.col.findOne({ key });
    return Ok(this.toEntity(dbEntity));
  }
}
