import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { USER } from './authService';

export const PROJECT_TAG = 'project';
export const PUBLIC_ACCESS = '*';

export const AllowScopes = (scopes: string[] | string): Type<CanActivate> => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    private routeExpectedClaims: string[];
    constructor(private readonly cls: ClsService) {
      this.routeExpectedClaims = Array.isArray(scopes) ? scopes : [scopes];
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        // Check reminder claims (roles, scopes)
        if (!this.routeExpectedClaims || !this.routeExpectedClaims.length) {
          throw new UnauthorizedException('Insufficient privileges');
        }
        if (this.routeExpectedClaims.find((s) => s === PUBLIC_ACCESS) !== undefined)
          return true;
        const user = this.cls.get(USER);
        if (!this.routeExpectedClaims.every((item: string) => user.claims.includes(item))) {
          throw new UnauthorizedException('Insufficient privileges');
        }
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }
  }

  const guard = mixin(AuthGuardMixin);
  return guard;
};
