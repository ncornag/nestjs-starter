import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { ProjectModel } from './projectModel';
import { ID, IDWithVersion, Version } from 'src/appModule.interfaces';
import {
  IProjectService,
  CreateProjectBody,
  UpdateProjectBody
} from './projectService.interface';
import { IProjectRepository, _IProjectRepository } from './projectRepository.interface';
import { _IOrgService, IOrgService } from '../org/orgService.interface';
import { ClsService } from 'nestjs-cls';
import { NotModifiedException } from 'src/shared/exceptions';
import { DuplicateKeyException, ProjectNotFoundException } from './projectExceptions';
import { USER } from '../auth/authService';

@Injectable()
export class ProjectService implements IProjectService {
  constructor(
    @Inject(_IProjectRepository)
    private readonly repository: IProjectRepository,
    @Inject(_IOrgService)
    private readonly orgService: IOrgService,
    private readonly logger: PinoLogger,
    private readonly cls: ClsService
  ) {}

  // CREATE
  async create(data: CreateProjectBody): Promise<IDWithVersion> {
    // Validate key
    const projectResult = await this.repository.find({ key: data.key });
    if (projectResult.isOk() && projectResult.value[0]) throw new DuplicateKeyException();
    // Validate Org
    const org = await this.orgService.findById(data.orgId);
    // Create the Project
    const id = nanoid();
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.create({ id, ownerId, ...data });
    if (result.isErr()) throw new BadRequestException(result.error);
    // Add the Project to the Org
    await this.orgService.addProject(org.id, id);
    // Return id data
    return result.value;
  }

  // FIND
  async findById(id: ID): Promise<ProjectModel> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.find({ id, ownerId });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new ProjectNotFoundException();
    return result.value[0];
  }

  // UPDATE
  async update(id: ID, version: Version, data: UpdateProjectBody): Promise<ProjectModel> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.updateOne({ id, version, ownerId }, data);
    if (result.isErr()) throw result.error;
    if (version === result.value.version) throw new NotModifiedException();
    return result.value;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const result = await this.repository.deleteOne({ id, ownerId });
    const ownerId = this.cls.get(USER).id;
    if (result.isErr()) throw result.error;
    return result.value;
  }

  // FIND BY KEY
  async findByKey(key: string): Promise<ProjectModel | undefined> {
    const result = await this.repository.find({ key });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new NotFoundException('Project not found');
    return result.value[0];
  }
}
