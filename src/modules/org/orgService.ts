import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import { OrgModel } from './orgModel';
import { ID } from 'src/appModule.interfaces';
import {
  IOrgService,
  CreateOrgBody,
  UpdateOrgBody
} from './orgService.interface';
import { IOrgRepository, _IOrgRepository } from './orgRepository.interface';
import { RequestContext } from 'nestjs-request-context';
import { IncomingMessage } from 'http';

@Injectable()
export class OrgService implements IOrgService {
  constructor(
    @Inject(_IOrgRepository)
    private readonly repository: IOrgRepository,
    private readonly logger: PinoLogger
  ) {}

  getRequestId() {
    const req = RequestContext.currentContext.req as IncomingMessage;
    return req.id;
  }

  // CREATE
  async createWithOwner(ownerId: ID, data: CreateOrgBody): Promise<ID> {
    const id = nanoid();
    await this.repository.create({
      id,
      ownerId,
      ...data
    });
    return id;
  }
  async create(data: CreateOrgBody): Promise<ID> {
    throw new NotImplementedException();
  }

  // FIND
  async findById(id: ID): Promise<OrgModel> {
    const result = await this.repository.findById(id);
    if (result.isErr()) throw result.error;
    if (!result.value) throw new NotFoundException('Org not found');
    return result.value;
  }

  // UPDATE
  async update(id: ID, data: UpdateOrgBody): Promise<OrgModel> {
    const result = await this.repository.update(id, data);
    if (result.isErr()) throw result.error;
    return result.value;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const result = await this.repository.findById(id);
    if (result.isErr()) throw result.error;
    if (!result.value) throw new NotFoundException('Org not found');
    if (result.value.projects.length)
      throw new BadRequestException("Can't delete an Org with Projects");
    const deleteResult = await this.repository.delete(id);
    if (deleteResult.isErr()) throw deleteResult.error;
    return deleteResult.value;
  }
}
