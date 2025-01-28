import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { NotModifiedException, ValidationException } from 'src/shared/exceptions';
import { DuplicateKeyException, ProjectNotFoundException } from './projectExceptions';
import { USER } from '../auth/authService';
import { OrgNotFoundException } from '../org/orgExceptions';

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
    // Validate Org, converting the 404 to a 400 Validation failed error
    let org;
    try {
      org = await this.orgService.findById(data.orgId);
    } catch (e) {
      if (e instanceof NotFoundException)
        throw new ValidationException([{ message: e.message }]);
      throw e;
    }
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
  async delete(id: string, version: Version): Promise<void> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.deleteOne({ id, version, ownerId });
    if (result.isErr()) throw result.error;
    // Delete the Project from the Org
    await this.orgService.removeProject(id, ownerId);
    return result.value;
  }
}
