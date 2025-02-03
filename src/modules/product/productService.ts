import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/authService';
import { ID } from 'src/appModule.interfaces';
import { ProductModel } from './productModel';

@Injectable()
export class ProductService {
  constructor(private readonly authService: AuthService) {
    authService.addScopes(['catalog:read', 'catalog:write', 'catalog:index']);
  }

  async findById(id: ID): Promise<ProductModel> {
    return {
      id: '1',
      catalogId: 'online',
      name: { en: 'ADIZERO PRIME X 2 STRUNG RUNNING SHOES' },
      description: { en: 'Built with innovative technology and designed without ...' },
      slug: { en: 'adizero-prime-x-2-strung-running-shoes' },
      searchKeywords: { en: [{ text: 'running' }, { text: 'shoes' }] },
      categories: ['shoes'],
      type: 'base'
    } as unknown as ProductModel;
  }
}
