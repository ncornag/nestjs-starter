import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { PROJECT } from './authService';

@Injectable()
export class ApiClientAuthGuard extends AuthGuard('api-client') {
  constructor(private readonly cls: ClsService) {
    super();
  }
  canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const requestProjectKey = request.params.projectKey;
      if (requestProjectKey) {
        this.cls.set(PROJECT, { key: requestProjectKey });
      }
    } catch (e) {
      return false;
    }
    //return true;
    return super.canActivate(context);
  }
}
