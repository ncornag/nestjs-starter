import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { PROJECT, USER } from './authService';
import { PROJECT_TAG } from './scopesAuthGuard';

@Injectable()
export class ProjectAuthGuard extends AuthGuard('project') {
  constructor(private readonly cls: ClsService) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // Check request projectKey
    const request = context.switchToHttp().getRequest();
    const projectKey = request.params.projectKey;
    if (!projectKey) return false;

    // Check project claim
    const user = this.cls.get(USER);
    if (user) {
      const claimProjectId = user.claims.find((s) => s.split(':')[0] === PROJECT_TAG);
      if (!claimProjectId || projectKey !== claimProjectId.split(':')[1]) {
        throw new UnauthorizedException('Invalid project');
      }
    }

    // Set project
    this.cls.set(PROJECT, { key: projectKey });
    return true;
  }
}
