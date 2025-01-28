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
  HttpStatus
} from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  _IOrgService,
  IOrgService,
  CreateOrgBodySchema,
  CreateOrgBody,
  UpdateOrgBodySchema,
  UpdateOrgBody,
  OrgResponseSchema
} from './orgService.interface';
import { OrgModel, OrgModelSchema } from './orgModel';
import {
  idSchema,
  ID,
  Version,
  versionSchema,
  IDWithVersion,
  IDWithVersionSchema
} from 'src/appModule.interfaces';
import { JwtAuthGuard } from '../auth/jwtAuthGuard';
import { AllowScopes } from '../auth/scopesAuthGuard';
import { ADMIN_CLAIMS } from '../user/userService';

// CONTROLLER
@Controller('orgs')
export class OrgController {
  constructor(
    @Inject(_IOrgService)
    private readonly service: IOrgService
  ) {}

  // CREATE
  @Post()
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: IDWithVersionSchema,
    request: [
      {
        type: 'body',
        schema: CreateOrgBodySchema
      }
    ]
  })
  async create(data: CreateOrgBody, @Res() res): Promise<IDWithVersion> {
    const idData = await this.service.create(data);
    return await res.status(HttpStatus.CREATED).send(idData);
  }

  // GET
  @Get(':id')
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: OrgResponseSchema,
    request: [
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      }
    ]
  })
  async get(id: ID): Promise<OrgModel> {
    return await this.service.findById(id);
  }

  // UPDATE
  @Patch(':id')
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: OrgModelSchema,
    request: [
      { name: 'id', type: 'param', schema: idSchema },
      { name: 'version', type: 'query', schema: versionSchema },
      { type: 'body', schema: UpdateOrgBodySchema }
    ]
  })
  async update(id: ID, version: Version, data: UpdateOrgBody): Promise<OrgModel> {
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
