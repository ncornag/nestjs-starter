import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export const PRODUCT_NOT_FOUND = 'Product not found';
export class ProductNotFoundException extends NotFoundException {
  constructor() {
    super(PRODUCT_NOT_FOUND);
  }
}
