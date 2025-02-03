import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PROJECT, USER } from './authService';

export const PROJECT_SCOPED = 'projectScoped';
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
        const user = this.cls.get(USER);
        const request = context.switchToHttp().getRequest();
        // Check project claim
        const requestProjectKey = request.params.projectKey;
        if (requestProjectKey) {
          this.cls.set(PROJECT, { key: requestProjectKey });
        }
        if (this.routeExpectedClaims.find((s) => s === PROJECT_SCOPED) !== undefined) {
          if (!requestProjectKey) {
            throw new UnauthorizedException('Invalid project');
          }
          const claimProjectId = user.claims.find((s) => s.split(':')[0] === PROJECT_TAG);
          if (!claimProjectId || requestProjectKey !== claimProjectId.split(':')[1]) {
            throw new UnauthorizedException('Invalid project');
          }
        }
        // Check reminder claims (roles, scopes)
        if (!this.routeExpectedClaims || !this.routeExpectedClaims.length) {
          throw new UnauthorizedException('Insufficient privileges');
        }
        if (this.routeExpectedClaims.find((s) => s === PUBLIC_ACCESS) !== undefined)
          return true;
        if (
          !this.routeExpectedClaims
            .filter((s) => s !== PROJECT_SCOPED)
            .every((item: string) => user.claims.includes(item))
        ) {
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
