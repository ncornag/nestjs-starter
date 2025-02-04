import { ICatalogAwareRepository } from 'src/appModule.interfaces';
import { ProductModel } from './productModel';

export const _IProductRepository = 'IProductRepository';

export interface IProductRepository extends ICatalogAwareRepository<ProductModel> {}
