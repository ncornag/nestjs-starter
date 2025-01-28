import { Get, Delete, Patch, Post, Controller, Inject, Res, UseGuards } from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  _IProjectService,
  IProjectService,
  CreateProjectBodySchema,
  CreateProjectBody,
  UpdateProjectBodySchema,
  UpdateProjectBody
} from '../project/projectService.interface';
import { ProjectModel, ProjectModelSchema } from '../project/projectModel';
import { idSchema, ID, projectIdSchema, ProjectID } from 'src/appModule.interfaces';
import { AllowScopes } from 'src/modules/auth/scopesAuthGuard';

// CONTROLLER
@Controller(':projectId/products')
export class ProductController {
  constructor(
    @Inject(_IProjectService)
    private readonly service: IProjectService
  ) {}

  // @UseGuards(AllowScopes('catalog:write'))
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
  async create(projectId: ProjectID, data: CreateProjectBody, @Res() res): Promise<string> {
    const idData = await this.service.create(data);
    return await res.status(201).send(idData);
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
  async update(projectId: ProjectID, id: ID, data: UpdateProjectBody): Promise<ProjectModel> {
    return await this.service.update(id, 0, data);
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
    await this.service.delete(id, 0);
    return await res.status(204).send();
  }
}
