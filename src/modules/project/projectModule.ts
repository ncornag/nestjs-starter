import { forwardRef, Module } from '@nestjs/common';
import { ProjectController } from './projectController';
import { ProjectService } from './projectService';
import { _IProjectService } from './projectService.interface';
import { ProjectRepository } from './projectRepository';
import { _IProjectRepository } from './projectRepository.interface';
import { OrgModule } from '../org/orgModule';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { AuthModule } from '../auth/authModule';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => OrgModule), DatabaseModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: _IProjectService,
      useClass: ProjectService
    },
    {
      provide: _IProjectRepository,
      useClass: ProjectRepository
    }
  ],
  exports: [_IProjectService]
})
export class ProjectModule {}
