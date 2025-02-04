import {
  Get,
  Delete,
  Patch,
  Post,
  Controller,
  Inject,
  Res,
  UseGuards,
  Param,
  UseInterceptors
} from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  _IProjectService,
  IProjectService as IProductService,
  CreateProjectBodySchema,
  CreateProjectBody,
  UpdateProjectBodySchema,
  UpdateProjectBody
} from '../project/projectService.interface';
import { ProjectModel, ProjectModelSchema } from '../project/projectModel';
import {
  idSchema,
  ID,
  projectKeySchema,
  ProjectKey,
  IDWithVersionSchema,
  IDWithVersion
} from 'src/appModule.interfaces';
import { AllowScopes, PUBLIC_ACCESS } from 'src/modules/auth/scopesAuthGuard';
import { JwtAuthGuard } from '../auth/jwtAuthGuard';
import { _IProductService } from './productService.interface';
import { ProductModel, ProductModelSchema } from './productModel';
import { ProjectAuthGuard } from '../auth/projectAuthGuard';

// CONTROLLER
@Controller(':projectKey/products')
@UseGuards(JwtAuthGuard, ProjectAuthGuard)
export class ProductController {
  constructor(
    @Inject(_IProductService)
    private readonly service: IProductService
  ) {}

  // @UseGuards(AllowScopes('catalog:write'))
  @Post()
  @Validate({
    response: IDWithVersionSchema,
    request: [
      {
        name: 'projectKey',
        type: 'param',
        schema: projectKeySchema
      },
      {
        type: 'body',
        schema: CreateProjectBodySchema
      }
    ]
  })
  async create(
    projectKey: ProjectKey,
    data: CreateProjectBody,
    @Res({ passthrough: true }) res
  ): Promise<IDWithVersion> {
    const idData = await this.service.create(data);
    res.status(201);
    return idData;
  }

  // GET
  @Get(':id')
  @UseGuards(AllowScopes('catalog:read'))
  @Validate({
    response: ProductModelSchema,
    request: [
      {
        name: 'projectKey',
        type: 'param',
        schema: projectKeySchema
      },
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      }
    ]
  })
  async get(projectKey: ProjectKey, id: ID): Promise<ProductModel> {
    return (await this.service.findById(id)) as unknown as ProductModel;
  }

  // UPDATE
  @Patch(':id')
  @Validate({
    response: ProjectModelSchema,
    request: [
      {
        name: 'projectKey',
        type: 'param',
        schema: projectKeySchema
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
  async update(projectKey: ProjectKey, id: ID, data: UpdateProjectBody): Promise<ProjectModel> {
    return await this.service.update(id, 0, data);
  }

  // DELETE
  @Delete(':id')
  @Validate({
    request: [
      {
        name: 'projectKey',
        type: 'param',
        schema: projectKeySchema
      },
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      }
    ]
  })
  async delete(projectKey: ProjectKey, id: ID, @Res({ passthrough: true }) res): Promise<void> {
    await this.service.delete(id, 0);
    res.status(204);
    return;
  }
}
