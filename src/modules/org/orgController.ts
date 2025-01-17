import {
  Get,
  Delete,
  Patch,
  Post,
  Controller,
  Inject,
  Res,
  Request,
  UseGuards
} from '@nestjs/common';
import { Validate } from 'nestjs-typebox';
import {
  _IOrgService,
  IOrgService,
  CreateOrgBodySchema,
  CreateOrgBody,
  UpdateOrgBodySchema,
  UpdateOrgBody
} from './orgService.interface';
import { OrgModel, OrgModelSchema } from './orgModel';
import { idSchema, ID } from 'src/appModule.interfaces';
import { JwtAuthGuard } from '../auth/jwtAuthGuard';

// CONTROLLER
@Controller('orgs')
export class OrgController {
  constructor(
    @Inject(_IOrgService)
    private readonly service: IOrgService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Validate({
    response: idSchema,
    request: [
      {
        type: 'body',
        schema: CreateOrgBodySchema
      }
    ]
  })
  async create(
    data: CreateOrgBody,
    @Res() res,
    @Request() req
  ): Promise<string> {
    const id = await this.service.createWithOwner(req.user.id, data);
    return res.status(201).send({ id });
  }

  // GET
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Validate({
    response: OrgModelSchema,
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
  @UseGuards(JwtAuthGuard)
  @Validate({
    response: OrgModelSchema,
    request: [
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      },
      {
        type: 'body',
        schema: UpdateOrgBodySchema
      }
    ]
  })
  async update(id: ID, data: UpdateOrgBody): Promise<OrgModel> {
    return await this.service.update(id, data);
  }

  // DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Validate({
    request: [
      {
        name: 'id',
        type: 'param',
        schema: idSchema
      }
    ]
  })
  async delete(id: ID, @Res() res): Promise<void> {
    await this.service.delete(id);
    return res.status(204).send();
  }
}
