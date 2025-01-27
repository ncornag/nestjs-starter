import { HttpException, HttpStatus } from '@nestjs/common';

export const NOT_MODIFIED = 'NotModified';
export class NotModifiedException extends HttpException {
  constructor() {
    super(NOT_MODIFIED, HttpStatus.NOT_MODIFIED);
  }
}
