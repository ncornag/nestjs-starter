import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { UserModel } from './userModel';
import { IUserRepository } from './userRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID } from 'src/appModule.interfaces';
import { DB, type DbEntity } from 'src/infrastructure/databaseModule';

@Injectable()
export class UserRepository implements IUserRepository {
  private col: Collection<DbEntity<UserModel>>;

  constructor(
    @Inject('DB')
    private db: DB
  ) {
    this.col = this.db.getDb().collection<DbEntity<UserModel>>('users');
  }

  private toEntity = (dbEntity: DbEntity<UserModel>): UserModel | undefined => {
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
  }: UserModel): DbEntity<UserModel> => ({
    _id: id,
    ...remainder
  });

  // CREATE
  async create(input: UserModel): Promise<Result<ID, Error>> {
    const result = await this.col.insertOne(this.toDbEntity(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok(result.insertedId);
  }

  // FIND
  async findById(id: string): Promise<Result<UserModel | undefined, Error>> {
    const dbEntity = await this.col.findOne({ _id: id });
    return Ok(this.toEntity(dbEntity));
  }

  // UPDATE
  async update(
    id: string,
    data: Partial<UserModel>
  ): Promise<Result<UserModel, Error>> {
    const dbEntity = await this.col.findOne({ _id: id });
    if (!dbEntity) throw new NotFoundException('User not found');
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

  // FIND BY USERNAME
  async findByUsername(
    username: string
  ): Promise<Result<UserModel | undefined, Error>> {
    const dbEntity = await this.col.findOne({ username });
    return Ok(this.toEntity(dbEntity));
  }
}
