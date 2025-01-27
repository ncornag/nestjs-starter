import { HttpException, HttpStatus } from '@nestjs/common';

export const PROJECT_NOT_FOUND = 'Project not found';
export class ProjectNotFoundException extends HttpException {
  constructor() {
    super(PROJECT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export const PROJECT_DUPLICATE_KEY = 'Duplicate key';
export class DuplicateKeyException extends HttpException {
  constructor() {
    super(PROJECT_DUPLICATE_KEY, HttpStatus.BAD_REQUEST);
  }
}
