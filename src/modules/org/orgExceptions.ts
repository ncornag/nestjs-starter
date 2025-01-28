import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

export const ORG_NOT_FOUND = 'Org not found';
export class OrgNotFoundException extends NotFoundException {
  constructor() {
    super(ORG_NOT_FOUND);
  }
}

export const ORG_WITH_PROJECTS = 'Org with Projects';
export class OrgWithProjectsException extends HttpException {
  constructor() {
    super(ORG_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }
}
