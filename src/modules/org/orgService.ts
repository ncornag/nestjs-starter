import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { OrgModel } from './orgModel';
import { ID, IDWithVersion, Version } from 'src/appModule.interfaces';
import { IOrgService, CreateOrgBody, UpdateOrgBody } from './orgService.interface';
import { IOrgRepository, _IOrgRepository } from './orgRepository.interface';
import { ClsService } from 'nestjs-cls';
import { NotModifiedException } from 'src/shared/exceptions';
import { OrgNotFoundException, OrgWithProjectsException } from './orgExceptions';
import { USER } from '../auth/authService';

@Injectable()
export class OrgService implements IOrgService {
  constructor(
    @Inject(_IOrgRepository)
    private readonly repository: IOrgRepository,
    private readonly logger: PinoLogger,
    private readonly cls: ClsService
  ) {}

  // CREATE
  async create(data: CreateOrgBody): Promise<IDWithVersion> {
    // Create the Org
    const id = nanoid();
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.create({
      id,
      ownerId,
      ...data
    });
    if (result.isErr()) throw new BadRequestException(result.error);
    // Return id data
    return result.value;
  }

  // FIND
  async findById(id: ID): Promise<OrgModel> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.find({ id, ownerId });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new OrgNotFoundException();
    return result.value[0];
  }

  // UPDATE
  async update(id: ID, version: Version, data: UpdateOrgBody): Promise<OrgModel> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.updateOne({ id, version, ownerId }, data);
    if (result.isErr()) throw result.error;
    if (version === result.value.version) throw new NotModifiedException();
    return result.value;
  }

  // DELETE
  async delete(id: string, version: Version): Promise<void> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.find({ id, ownerId, version });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new OrgNotFoundException();
    if (result.value[0].projects.length) throw new OrgWithProjectsException();
    const deleteResult = await this.repository.deleteOne({ id, version, ownerId });
    if (deleteResult.isErr()) throw deleteResult.error;
    return deleteResult.value;
  }

  // ADD PROJECT
  async addProject(orgId: ID, projectId: ID): Promise<void> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.addProject(projectId, ownerId, orgId);
    if (result.isErr()) throw result.error;
    return;
  }

  // REMOVE PROJECT
  async removeProject(projectId: ID): Promise<void> {
    const ownerId = this.cls.get(USER).id;
    const result = await this.repository.removeProject(projectId, ownerId);
    if (result.isErr()) throw result.error;
    return;
  }
}
