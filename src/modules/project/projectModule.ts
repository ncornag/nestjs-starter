import { Module } from '@nestjs/common';
import { ProjectController } from './projectController';
import { ProjectService } from './projectService';
import { PROJECT_SERVICE_TOKEN } from './projectService.interface';
import { ProjectRepository } from './projectRepository';
import { PROJECT_REPOSITORY_TOKEN } from './projectRepository.interface';

@Module({
  controllers: [ProjectController],
  providers: [
    ProjectService,
    {
      provide: PROJECT_SERVICE_TOKEN,
      useClass: ProjectService
    },
    {
      provide: PROJECT_REPOSITORY_TOKEN,
      useClass: ProjectRepository
    }
  ]
  //exports: [ProjectService]
})
export class ProjectModule {}
