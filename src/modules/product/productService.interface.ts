import { Type, type Static } from '@sinclair/typebox';
import { IAwareCatalogService, ID, IDWithVersion, IService } from 'src/appModule.interfaces';
import { ProductModel, ProductModelSchema } from './productModel';

export const _IProductService = 'IProductService';

// RESPONSE
export const ProductResponseSchema = ProductModelSchema;
export type ProductResponse = Static<typeof ProductResponseSchema>;

// CREATE
export const CreateProductBodySchema = Type.Omit(ProductModelSchema, ['id'], {
  additionalProperties: false
});
export type CreateProductBody = Static<typeof CreateProductBodySchema>;

// UPDATE
export const UpdateProductBodySchema = Type.Partial(Type.Omit(ProductModelSchema, ['id']), {
  additionalProperties: false
});
export type UpdateProductBody = Static<typeof UpdateProductBodySchema>;

export const UpdateProductParamsSchema = Type.String();
export type UpdateProductParams = Static<typeof UpdateProductParamsSchema>;

// INTERFACE
export interface IProductService
  extends IAwareCatalogService<ProductModel, CreateProductBody, UpdateProductBody> {}
