import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { ProjectModel } from './projectModel';
import { IProjectService } from './projectService.interface';
import {
  IProjectRepository,
  PROJECT_REPOSITORY_TOKEN
} from './projectRepository.interface';

@Injectable()
export class ProjectService implements IProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly repository: IProjectRepository
  ) {}

  // CREATE
  async create(data) {
    const project = await this.repository.findByKey(data.key);
    if (project) throw new BadRequestException('Project key already exists');
    const id = nanoid();
    await this.repository.create({ id, ...data });
    return id;
  }

  // FIND
  async findById(id: string): Promise<ProjectModel> {
    const project = await this.repository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // UPDATE
  async update(id: string, data: any): Promise<ProjectModel> {
    if (data.key) throw new BadRequestException('key cannot be updated');
    return await this.repository.update(id, data);
  }

  // DELETE
  async delete(id: string): Promise<void> {
    this.repository.delete(id);
  }
}
