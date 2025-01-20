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
import { IOrgService, CreateOrgBody, UpdateOrgBody } from './orgService.interface';
import { IOrgRepository, _IOrgRepository } from './orgRepository.interface';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class OrgService implements IOrgService {
  constructor(
    @Inject(_IOrgRepository)
    private readonly repository: IOrgRepository,
    private readonly logger: PinoLogger,
    private readonly cls: ClsService
  ) {}

  // CREATE
  async create(data: CreateOrgBody): Promise<ID> {
    const id = nanoid();
    const ownerId = this.cls.get('user').id;
    await this.repository.create({
      id,
      ownerId,
      ...data
    });
    return id;
  }

  // FIND
  async findById(id: ID): Promise<OrgModel> {
    const ownerId = this.cls.get('user').id;
    const result = await this.repository.find({ id, ownerId });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new NotFoundException('Org not found');
    return result.value[0];
  }

  // UPDATE
  async update(id: ID, data: UpdateOrgBody): Promise<OrgModel> {
    const result = await this.repository.updateOne({ id }, data);
    if (result.isErr()) throw result.error;
    return result.value;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    const ownerId = this.cls.get('user').id;
    const result = await this.repository.find({ id, ownerId });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) throw new NotFoundException('Org not found');
    if (result.value[0].projects.length)
      throw new BadRequestException("Can't delete an Org with Projects");
    const deleteResult = await this.repository.deleteOne(id);
    if (deleteResult.isErr()) throw deleteResult.error;
    return deleteResult.value;
  }
}
