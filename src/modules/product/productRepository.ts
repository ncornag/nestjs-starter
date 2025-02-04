import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductModel } from './productModel';
import { IProductRepository, _IProductRepository } from './productRepository.interface';
import { Collection } from 'mongodb';
import { Err, Ok, Result } from 'ts-results-es';
import { ID, IDWithVersion } from 'src/appModule.interfaces';
import { type DbEntity, toEntity, toDbEntity } from 'src/infrastructure/db/dbModule';
import { mongoDiff } from 'src/infrastructure/db/mongoDiff';
import { DbService } from 'src/infrastructure/db/dbService';

@Injectable()
export class ProductRepository implements IProductRepository {
  private col: Collection<DbEntity<ProductModel>>;

  constructor(
    @Inject('DbService')
    private db: DbService
  ) {}

  private getCol(catalogId: ID) {
    if (!this.col) {
      this.col = this.db.getDb().collection<DbEntity<ProductModel>>(`products_${catalogId}`);
    }
    return this.col;
  }

  // CREATE
  async create(catalogId: ID, input: ProductModel): Promise<Result<IDWithVersion, Error>> {
    const result = await this.getCol(catalogId).insertOne(toDbEntity<ProductModel>(input));
    if (!result.insertedId) return Err(new Error('Not created'));
    return Ok({ id: result.insertedId, version: 0 });
  }

  // FIND
  async find(catalogId: ID, where: any): Promise<Result<ProductModel[] | undefined, Error>> {
    const dbEntities = await this.getCol(catalogId)
      .find(toDbEntity<ProductModel>(where))
      .toArray();
    return Ok(dbEntities.map((dbEntity) => toEntity<ProductModel>(dbEntity)));
  }

  // UPDATE
  async updateOne(
    catalogId: ID,
    where: any,
    data: Partial<ProductModel>
  ): Promise<Result<ProductModel, Error>> {
    const dbEntity = await this.getCol(catalogId).findOne(toDbEntity<ProductModel>(where));
    if (!dbEntity) throw new NotFoundException('Product not found');
    const { ops, updated } = mongoDiff(dbEntity, data);
    if (!ops) return Ok(toEntity<ProductModel>(updated));
    const updateResult = await this.getCol(catalogId).updateOne(
      toDbEntity<ProductModel>(where),
      ops
    );
    if (updateResult.modifiedCount !== 1)
      return Err(new Error(`Modified count=${updateResult.modifiedCount}`));
    return Ok(toEntity<ProductModel>({ ...updated, version: updated.version + 1 }));
  }

  // DELETE
  async deleteOne(catalogId: ID, where: any): Promise<Result<void, Error>> {
    const result = await this.getCol(catalogId).deleteOne(toDbEntity<ProductModel>(where));
    if (result.deletedCount !== 1)
      return Err(new Error(`Deleted count=${result.deletedCount}`));
    return Ok(undefined);
  }
}
