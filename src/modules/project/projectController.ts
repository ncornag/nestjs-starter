import {
  Get,
  Delete,
  Patch,
  Post,
  Controller,
  Inject,
  Res,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  _IProjectService,
  IProjectService,
  CreateProjectBodySchema,
  CreateProjectBody,
  UpdateProjectBodySchema,
  UpdateProjectBody,
  ProjectResponseSchema
} from './projectService.interface';
import { ProjectModel } from './projectModel';
import {
  idSchema,
  ID,
  IDWithVersionSchema,
  IDWithVersion,
  versionSchema,
  Version
} from 'src/appModule.interfaces';
import { AllowScopes } from 'src/modules/auth/scopesAuthGuard';
import { JwtAuthGuard } from '../auth/jwtAuthGuard';
import { ADMIN_CLAIMS } from '../user/userService';

// CONTROLLER
@Controller('projects')
export class ProjectController {
  constructor(
    @Inject(_IProjectService)
    private readonly service: IProjectService
  ) {}

  // CREATE
  @Post()
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: IDWithVersionSchema,
    request: [{ type: 'body', schema: CreateProjectBodySchema }]
  })
  async create(data: CreateProjectBody, @Res() res): Promise<IDWithVersion> {
    const idData = await this.service.create(data);
    return await res.status(HttpStatus.CREATED).send(idData);
  }

  // GET
  @Get(':id')
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: ProjectResponseSchema,
    request: [{ name: 'id', type: 'param', schema: idSchema }]
  })
  async get(id: ID): Promise<ProjectModel> {
    return await this.service.findById(id);
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: ProjectResponseSchema,
    request: [
      { name: 'id', type: 'param', schema: idSchema },
      { name: 'version', type: 'query', schema: versionSchema },
      { type: 'body', schema: UpdateProjectBodySchema }
    ]
  })
  async update(id: ID, version: Version, data: UpdateProjectBody): Promise<ProjectModel> {
    return await this.service.update(id, version, data);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    request: [
      { name: 'id', type: 'param', schema: idSchema },
      { name: 'version', type: 'query', schema: versionSchema }
    ]
  })
  async delete(id: ID, version: Version, @Res() res): Promise<void> {
    await this.service.delete(id, version);
    return await res.status(HttpStatus.NO_CONTENT).send();
  }
}
