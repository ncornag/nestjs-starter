import { Body, Controller, Inject, Param, Res } from '@nestjs/common';
import { HttpEndpoint } from 'nestjs-typebox';
import {
  PROJECT_SERVICE_TOKEN,
  IProjectService,
  CreateProjectSchema,
  CreateProject,
  UpdateProjectSchema,
  UpdateProject
} from './projectService.interface';
import { ProjectModel, ProjectModelSchema } from './projectModel';
import { idSchema, ID } from 'src/appModule.interfaces';

// CONTROLLER
@Controller({ path: 'project' })
export class ProjectController {
  constructor(
    @Inject(PROJECT_SERVICE_TOKEN)
    private readonly service: IProjectService
  ) {}

  // CREATE
  @HttpEndpoint({
    method: 'POST',
    validate: {
      response: idSchema,
      request: [{ type: 'body', schema: CreateProjectSchema }]
    }
  })
  async create(@Body() data: CreateProject, @Res() res): Promise<string> {
    const id = await this.service.create(data);
    return res.status(201).send({ id });
  }

  // GET
  @HttpEndpoint({
    method: 'GET',
    path: ':id',
    validate: {
      response: ProjectModelSchema,
      request: [
        {
          name: 'id',
          type: 'param',
          schema: idSchema
        }
      ]
    }
  })
  async get(@Param('id') id: ID): Promise<ProjectModel> {
    return await this.service.findById(id);
  }

  // UPDATE
  @HttpEndpoint({
    method: 'PATCH',
    path: ':id',
    validate: {
      response: ProjectModelSchema,
      request: [
        {
          name: 'id',
          type: 'param',
          schema: idSchema
        },
        {
          type: 'body',
          schema: UpdateProjectSchema
        }
      ]
    }
  })
  async update(
    @Param('id') id: ID,
    @Body() data: UpdateProject
  ): Promise<ProjectModel> {
    return await this.service.update(id, data);
  }

  // DELETE
  @HttpEndpoint({
    method: 'DELETE',
    path: ':id',
    validate: {
      request: [
        {
          name: 'id',
          type: 'param',
          schema: idSchema
        }
      ]
    }
  })
  async delete(@Param('id') id: ID, @Res() res): Promise<void> {
    await this.service.delete(id);
    return res.status(204).send();
  }
}
