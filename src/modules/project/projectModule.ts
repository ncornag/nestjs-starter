import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/databaseModule';
import { ProjectController } from './projectController';
import { ProjectService } from './projectService';
import { _IProjectService } from './projectService.interface';
import { ProjectRepository } from './projectRepository';
import { _IProjectRepository } from './projectRepository.interface';
import { RequestContextModule } from 'nestjs-request-context';

@Module({
  imports: [DatabaseModule, RequestContextModule],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    {
      provide: _IProjectService,
      useClass: ProjectService
    },
    {
      provide: _IProjectRepository,
      useClass: ProjectRepository
    }
  ],
  exports: [ProjectService]
})
export class ProjectModule {}
