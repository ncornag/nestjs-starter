import {
  Get,
  Delete,
  Patch,
  Post,
  Controller,
  Inject,
  Res,
  Request,
  UseGuards,
  HttpStatus,
  Req
} from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  idSchema,
  ID,
  projectKeySchema,
  ProjectKey,
  IDWithVersionSchema,
  IDWithVersion,
  versionSchema,
  Version
} from 'src/appModule.interfaces';
import { AllowScopes, PUBLIC_ACCESS } from 'src/modules/auth/scopesAuthGuard';
import { JwtAuthGuard } from '../auth/jwtAuthGuard';
import {
  _IProductService,
  CreateProductBody,
  CreateProductBodySchema,
  IProductService,
  UpdateProductBody,
  UpdateProductBodySchema
} from './productService.interface';
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

  @Post()
  @UseGuards(AllowScopes('catalog:write'))
  @Validate({
    response: IDWithVersionSchema,
    request: [
      { name: 'projectKey', type: 'param', schema: projectKeySchema },
      { name: 'catalogId', type: 'query', schema: idSchema },
      { type: 'body', schema: CreateProductBodySchema }
    ]
  })
  async create(
    projectKey: ProjectKey,
    catalogId: ID,
    data: CreateProductBody,
    @Res({ passthrough: true }) res
  ): Promise<IDWithVersion> {
    const idData = await this.service.create(catalogId, data);

    res.status(HttpStatus.CREATED);
    return idData;
  }

  // GET
  @Get(':id')
  @UseGuards(AllowScopes('catalog:read'))
  @Validate({
    response: ProductModelSchema,
    request: [
      { name: 'projectKey', type: 'param', schema: projectKeySchema },
      { name: 'catalogId', type: 'query', schema: idSchema },
      { name: 'id', type: 'param', schema: idSchema }
    ]
  })
  async get(projectKey: ProjectKey, catalogId: ID, id: ID): Promise<ProductModel> {
    return (await this.service.findById(catalogId, id)) as unknown as ProductModel;
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(AllowScopes('catalog:write'))
  @Validate({
    response: ProductModelSchema,
    request: [
      { name: 'projectKey', type: 'param', schema: projectKeySchema },
      { name: 'catalogId', type: 'query', schema: idSchema },
      { name: 'id', type: 'param', schema: idSchema },
      { name: 'version', type: 'query', schema: versionSchema },
      { type: 'body', schema: UpdateProductBodySchema }
    ]
  })
  async update(
    projectKey: ProjectKey,
    catalogId: ID,
    id: ID,
    version: Version,
    data: UpdateProductBody
  ): Promise<ProductModel> {
    return await this.service.update(catalogId, id, version, data);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(AllowScopes('catalog:write'))
  @Validate({
    request: [
      { name: 'projectKey', type: 'param', schema: projectKeySchema },
      { name: 'catalogId', type: 'query', schema: idSchema },
      { name: 'id', type: 'param', schema: idSchema },
      { name: 'version', type: 'query', schema: versionSchema }
    ]
  })
  async delete(
    projectKey: ProjectKey,
    catalogId: ID,
    id: ID,
    version: Version,
    @Res({ passthrough: true }) res
  ): Promise<void> {
    await this.service.delete(catalogId, id, version);
    res.status(HttpStatus.NO_CONTENT);
    return;
  }
}
