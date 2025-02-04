import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ApiClientModel } from './apiClientModel';
import { IApiClientRepository } from './apiClientRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { IDWithVersion } from 'src/appModule.interfaces';
import { type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/db/dbModule';
import { DbService } from 'src/infrastructure/db/dbService';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiClientRepository implements IApiClientRepository {
  private col: Collection<DbEntity<ApiClientModel>>;

  constructor(
    @Inject('DbService')
    private db: DbService,
    private configService: ConfigService
  ) {}

  public async onModuleInit() {
    this.col = this.db
      .getDb(this.configService.get<string>('MAIN_DB'))
      .collection<DbEntity<ApiClientModel>>('apiClients');
  }

  // CREATE
  async create(input: ApiClientModel): Promise<Result<IDWithVersion, Error>> {
    const result = await this.col.insertOne(toDbEntity<ApiClientModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok({ id: result.insertedId, version: 0 });
  }

  // FIND
  async find(where: any): Promise<Result<ApiClientModel[] | undefined, Error>> {
    const dbEntities = await this.col.find(toDbEntity<ApiClientModel>(where)).toArray();
    return Ok(dbEntities.map((dbEntity) => toEntity<ApiClientModel>(dbEntity)));
  }

  // UPDATE
  async updateOne(
    where: any,
    data: Partial<ApiClientModel>
  ): Promise<Result<ApiClientModel, Error>> {
    throw new NotImplementedException();
  }

  // DELETE
  async deleteOne(where: any): Promise<Result<void, Error>> {
    const result = await this.col.deleteOne(toDbEntity<ApiClientModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }
}
