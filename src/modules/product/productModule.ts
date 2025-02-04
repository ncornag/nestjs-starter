import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { AuthModule } from '../auth/authModule';
import { _IProductService } from './productService.interface';
import { ProductService } from './productService';
import { ProductController } from './productController';
import { _IProductRepository } from './productRepository.interface';
import { ProductRepository } from './productRepository';

@Module({
  imports: [forwardRef(() => AuthModule), DatabaseModule],
  controllers: [ProductController],
  providers: [
    { provide: _IProductService, useClass: ProductService },
    { provide: _IProductRepository, useClass: ProductRepository }
  ],
  exports: [_IProductService]
})
export class ProductModule {}
