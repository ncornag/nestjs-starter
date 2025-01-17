import * as fs from 'fs';
import * as path from 'path';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

// {
//   "jti": "Tj1cD7JG1Vf4p0eFO3dAL",
//   "sub": "app",
//   "iat": 1735554259,
//   "exp": 1767090259,
//   "scope": "catalog:read catalog:write",
//   "client_id": "app",
//   "iss": "http://ecomm.com",
//   "aud": "project:test"
// }

// {
//   "username": "john",
//   "sub": 1,
//   "iat": 1736530058,
//   "exp": 1768066058
// }
export const AllowScopes = (scopes: string[] | string): Type<CanActivate> => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    private publicKey: string;
    private routeScopes: string[];
    constructor(
      private jwtService: JwtService,
      private reflector: Reflector
    ) {
      this.publicKey = fs.readFileSync(
        path.join(__dirname, `/../../${process.env.PUBLIC_KEY_FILE}`),
        'ascii'
      );
      this.routeScopes = Array.isArray(scopes) ? scopes : [scopes];
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const user = await this.jwtService.verifyAsync(token, {
          publicKey: this.publicKey
        });
        const request = (context as any).getRequest();
        // Check the audience (projectId)
        const requestProjectId = request.params.projectId;
        const [_audTag, audProjectId] = user.aud.split(':');
        if (!requestProjectId || requestProjectId !== audProjectId)
          throw new UnauthorizedException('Invalid audience');
        // Check the scopes
        const userScopes = user.scope.split(' ');
        if (!this.routeScopes || !this.routeScopes.length)
          throw new UnauthorizedException('Insufficient privileges');
        if (this.routeScopes[0] === '*') return;
        if (
          !this.routeScopes.every((item: string) => userScopes.includes(item))
        )
          throw new UnauthorizedException('Insufficient privileges');
        request['user'] = user;
      } catch {
        throw new UnauthorizedException();
      }
      return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }

  const guard = mixin(AuthGuardMixin);
  return guard;
};
