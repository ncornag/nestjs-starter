import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';

export const PROJECT_SCOPED = 'projectScoped';
export const PROJECT_TAG = 'project';

export const AllowScopes = (scopes: string[] | string): Type<CanActivate> => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    private routeExpectedClaims: string[];
    constructor(
      private jwtService: JwtService,
      private reflector: Reflector,
      private readonly cls: ClsService
    ) {
      this.routeExpectedClaims = Array.isArray(scopes) ? scopes : [scopes];
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const user = this.cls.get('user');
        const request = (context as any).getRequest();
        // Check project claim
        if (this.routeExpectedClaims.find((s) => s === PROJECT_SCOPED) !== undefined) {
          const requestProjectId = request.params.projectId;
          if (!requestProjectId) {
            throw new UnauthorizedException('Invalid project');
          }
          const claimProjectId = user.claims.find((s) => s.split(':')[0] === PROJECT_TAG);
          if (!claimProjectId || requestProjectId !== claimProjectId.split(':')[1]) {
            throw new UnauthorizedException('Invalid project');
          }
        }
        // Check reminder claims (roles, scopes)
        if (!this.routeExpectedClaims || !this.routeExpectedClaims.length) {
          throw new UnauthorizedException('Insufficient privileges');
        }
        if (this.routeExpectedClaims[0] === '*') return;
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
