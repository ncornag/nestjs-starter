import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './projectController';
import { ProjectService } from './projectService';

describe('ProjectController', () => {
  let projectController: ProjectController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [ProjectService]
    }).compile();

    projectController = app.get<ProjectController>(ProjectController);
  });

  describe('project', () => {
    it('should return xyz', () => {
      expect(projectController.project({ id: 1 })).toBe({});
    });
  });
});
