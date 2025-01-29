import { nanoid } from 'nanoid';
import { PinoLogger } from 'nestjs-pino';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ApiClientModel } from './apiClientModel';
import { CreateApiClientBody, IApiClientService } from './apiClientService.interface';
import { _IApiClientRepository, IApiClientRepository } from './apiClientRepository.interface';
import { IDWithVersion } from 'src/appModule.interfaces';
import { PROJECT, USER } from '../auth/authService';
import { ClsService } from 'nestjs-cls';
import { _IProjectService, IProjectService } from '../project/projectService.interface';
import { ProjectNotFoundException } from '../project/projectExceptions';

@Injectable()
export class ApiClientService implements IApiClientService {
  constructor(
    @Inject(_IApiClientRepository)
    private readonly repository: IApiClientRepository,
    @Inject(_IProjectService)
    private readonly projectService: IProjectService,
    private readonly logger: PinoLogger,
    private readonly cls: ClsService
  ) {}

  // CREATE
  async create(data: CreateApiClientBody): Promise<IDWithVersion> {
    const projectKey = this.cls.get(PROJECT).key;
    const userId = this.cls.get(USER).id;
    const project = await this.projectService.findByKey(projectKey);
    if (!project) throw new ProjectNotFoundException();
    if (project.ownerId !== userId) throw new UnauthorizedException();
    const id = nanoid();
    const result = await this.repository.create({
      id,
      ...data
    });
    if (result.isErr()) throw new BadRequestException(result.error);
    return result.value;
  }

  // FIND BY CLIENTID
  async findByClientId(clientId: string): Promise<ApiClientModel | null> {
    const result = await this.repository.find({ clientId });
    if (result.isErr()) throw result.error;
    if (!result.value[0]) return;
    return result.value[0];
  }
}
