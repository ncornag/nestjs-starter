import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { ProjectModel } from './projectModel';
import {
  CreateProjectBody,
  IProjectService,
  UpdateProjectBody
} from './projectService.interface';
import {
  IProjectRepository,
  PROJECT_REPOSITORY_TOKEN
} from './projectRepository.interface';
import { ID } from 'src/appModule.interfaces';
import { PinoLogger } from 'nestjs-pino';
import { RequestContext } from 'nestjs-request-context';
import { IncomingMessage } from 'http';

@Injectable()
export class ProjectService implements IProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY_TOKEN)
    private readonly repository: IProjectRepository,
    private readonly logger: PinoLogger
  ) {}

  getRequestId() {
    const req = RequestContext.currentContext.req as IncomingMessage;
    return req.id;
  }

  // CREATE
  async create(data: CreateProjectBody) {
    const result = await this.repository.findByKey(data.key);
    if (result.isOk() && result.value)
      throw new BadRequestException('Project key already exists');
    const id = nanoid();
    await this.repository.create({ id, ...data });
    return id;
  }

  // FIND
  async findById(id: ID): Promise<ProjectModel> {
    const result = await this.repository.findById(id);
    if (result.isErr()) throw result.error;
    if (!result.value) throw new NotFoundException('Project not found');
    return result.value;
  }

  // UPDATE
  async update(id: ID, data: UpdateProjectBody): Promise<ProjectModel> {
    const result = await this.repository.update(id, data);
    if (result.isErr()) throw result.error;
    return result.value;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.isErr()) throw result.error;
    return result.value;
  }
}
