import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ProjectModel } from './projectModel';
import { IProjectRepository } from './projectRepository.interface';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  private readonly Projects: ProjectModel[] = [
    { id: '1', key: 'key1', state: 'online' },
    { id: '2', key: 'key2', state: 'offline' }
  ];

  // CREATE
  async create(input: ProjectModel): Promise<void> {
    this.Projects.push(input);
  }

  // FIND
  async findById(id: string): Promise<ProjectModel> {
    const project = this.Projects.find((project) => project.id === id);
    return project;
  }

  // UPDATE
  async update(id: string, data: ProjectModel): Promise<ProjectModel> {
    const project = this.Projects.find((project) => project.id === id);
    if (!project) throw new NotFoundException('Project not found');
    Object.assign(project, data);
    return project;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const index = this.Projects.findIndex((Project) => Project.id === id);
    if (index === -1) throw new NotFoundException('Project not found');
    this.Projects.splice(index, 1);
  }

  // FIND BY KEY
  async findByKey(key: string): Promise<ProjectModel> {
    const project = this.Projects.find((project) => project.key === key);
    return Promise.resolve(project);
  }
}
