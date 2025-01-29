import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserModel } from './userModel';
import { IUserRepository } from './userRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { IDWithVersion } from 'src/appModule.interfaces';
import { type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/db/dbModule';
import { mongoDiff } from 'src/infrastructure/db/mongoDiff';
import { DbService } from 'src/infrastructure/db/dbService';

@Injectable()
export class UserRepository implements IUserRepository {
  private col: Collection<DbEntity<UserModel>>;

  constructor(
    @Inject('DbService')
    private db: DbService
  ) {}

  public async onModuleInit() {
    this.col = this.db.getDb().collection<DbEntity<UserModel>>('users');
  }

  // CREATE
  async create(input: UserModel): Promise<Result<IDWithVersion, Error>> {
    const result = await this.col.insertOne(toDbEntity<UserModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok({ id: result.insertedId, version: 0 });
  }

  // FIND
  async find(where: any): Promise<Result<UserModel[] | undefined, Error>> {
    const dbEntities = await this.col.find(toDbEntity<UserModel>(where)).toArray();
    return Ok(dbEntities.map((dbEntity) => toEntity<UserModel>(dbEntity)));
  }

  // UPDATE
  async updateOne(where: any, data: Partial<UserModel>): Promise<Result<UserModel, Error>> {
    const dbEntity = await this.col.findOne(toDbEntity<UserModel>(where));
    if (!dbEntity) throw new NotFoundException('User not found');
    const { ops, updated } = mongoDiff(dbEntity, data);
    if (!ops) return Ok(toEntity<UserModel>(dbEntity));
    const updateResult = await this.col.updateOne(toDbEntity<UserModel>(where), ops);
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(toEntity<UserModel>({ ...updated, version: updated.version + 1 }));
  }

  // DELETE
  async deleteOne(where: any): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne(toDbEntity<UserModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }
}
