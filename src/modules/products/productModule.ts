import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { AuthModule } from '../auth/authModule';
import { _IProductService } from './productService.interface';
import { ProductService } from './productService';

@Module({
  imports: [forwardRef(() => AuthModule), DatabaseModule],
  controllers: [],
  providers: [
    {
      provide: _IProductService,
      useClass: ProductService
    }
  ],
  exports: []
})
export class ProductModule {}
