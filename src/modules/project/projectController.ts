import {
  Get,
  Delete,
  Patch,
  Post,
  Controller,
  Inject,
  Res,
  UseGuards
} from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  _IProjectService,
  IProjectService,
  CreateProjectBodySchema,
  CreateProjectBody,
  UpdateProjectBodySchema,
  UpdateProjectBody
} from './projectService.interface';
import { ProjectModel, ProjectModelSchema } from './projectModel';
import {
  idSchema,
  ID,
  projectIdSchema,
  ProjectID
} from 'src/appModule.interfaces';
import { AllowScopes } from 'src/modules/auth/authGuard';

// CONTROLLER
@Controller(':projectId/projects')
export class ProjectController {
  constructor(
    @Inject(_IProjectService)
    private readonly service: IProjectService
  ) {}

  @UseGuards(AllowScopes('catalog:write'))
  @Post()
  @Validate({
    response: idSchema,
    request: [
      {
        name: 'projectId',
        type: 'param',
        schema: projectIdSchema
      },
      {
        type: 'body',
        schema: CreateProjectBodySchema
      }
    ]
  })
  async create(
    projectId: ProjectID,
    data: CreateProjectBody,
    @Res() res
  ): Promise<string> {
    const id = await this.service.create(data);
    return res.status(201).send({ id });
  }

  // GET
  @Get(':id')
  @Validate({
    response: ProjectModelSchema,
    request: [
      {
        name: 'projectId',
        type: 'param',
        schema: projectIdSchema
      },
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      }
    ]
  })
  async get(projectId: ProjectID, id: ID): Promise<ProjectModel> {
    return await this.service.findById(id);
  }

  // UPDATE
  @Patch(':id')
  @Validate({
    response: ProjectModelSchema,
    request: [
      {
        name: 'projectId',
        type: 'param',
        schema: projectIdSchema
      },
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      },
      {
        type: 'body',
        schema: UpdateProjectBodySchema
      }
    ]
  })
  async update(
    projectId: ProjectID,
    id: ID,
    data: UpdateProjectBody
  ): Promise<ProjectModel> {
    return await this.service.update(id, data);
  }

  // DELETE
  @Delete(':id')
  @Validate({
    request: [
      {
        name: 'projectId',
        type: 'param',
        schema: projectIdSchema
      },
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      }
    ]
  })
  async delete(projectId: ProjectID, id: ID, @Res() res): Promise<void> {
    await this.service.delete(id);
    return res.status(204).send();
  }
}
