import { Injectable } from '@nestjs/common';
import { AuthService, USER } from '../auth/authService';

@Injectable()
export class ProductService {
  constructor(private readonly authService: AuthService) {
    authService.addScopes(['catalog:read', 'catalog:write', 'catalog:index']);
  }
}
