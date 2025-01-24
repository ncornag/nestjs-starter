import { HttpException, HttpStatus } from '@nestjs/common';

export class NotModifiedException extends HttpException {
  constructor() {
    super('NotModified', HttpStatus.NOT_MODIFIED);
  }
}
