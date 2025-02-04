import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AuthService, USER } from '../auth/authService';
import { ID, IDWithVersion, Version } from 'src/appModule.interfaces';
import { ProductModel } from './productModel';
import { PinoLogger } from 'nestjs-pino';
import { nanoid } from 'nanoid';
import { ProductNotFoundException } from './productExceptions';
import {
  CreateProductBody,
  IProductService,
  UpdateProductBody
} from './productService.interface';
import { NotModifiedException } from 'src/shared/exceptions';
import { _IProductRepository, IProductRepository } from './productRepository.interface';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    private readonly authService: AuthService,
    @Inject(_IProductRepository)
    private readonly repository: IProductRepository,
    private readonly logger: PinoLogger
  ) {
    authService.addScopes(['catalog:read', 'catalog:write', 'catalog:index']);
  }

  // Validate catalogId
  private validateCatalogId(catalogId: ID): void {
    // TODO Validate catalogId
    if (!catalogId) throw new BadRequestException('catalogId is required');
    if (typeof catalogId !== 'string')
      throw new BadRequestException('catalogId must be a string');
    if (catalogId.length < 1)
      throw new BadRequestException('catalogId must be at least 1 character long');
  }

  // CREATE
  async create(catalogId: ID, data: CreateProductBody): Promise<IDWithVersion> {
    this.validateCatalogId(catalogId);
    // Create the Product
    const id = nanoid();
    const result = await this.repository.create(catalogId, {
      id,
      ...data
    });
    if (result.isErr()) throw new BadRequestException(result.error);
    // Return id data
    return result.value;
  }

  // FIND
  async findById(catalogId: ID, id: ID): Promise<ProductModel> {
    this.validateCatalogId(catalogId);
    const result = await this.repository.find(catalogId, { id });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new ProductNotFoundException();
    return result.value[0];
  }

  // UPDATE
  async update(
    catalogId: ID,
    id: ID,
    version: Version,
    data: UpdateProductBody
  ): Promise<ProductModel> {
    this.validateCatalogId(catalogId);
    const result = await this.repository.updateOne(catalogId, { id, version }, data);
    if (result.isErr()) throw result.error;
    if (version === result.value.version) throw new NotModifiedException();
    return result.value;
  }

  // DELETE
  async delete(catalogId: ID, id: string, version: Version): Promise<void> {
    this.validateCatalogId(catalogId);
    const result = await this.repository.find(catalogId, { id, version });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new ProductNotFoundException();
    const deleteResult = await this.repository.deleteOne(catalogId, { id, version });
    if (deleteResult.isErr()) throw deleteResult.error;
    return deleteResult.value;
  }
}
