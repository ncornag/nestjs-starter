import { Controller, Get, HttpStatus, Inject, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/authService';
import { Validate } from 'nestjs-typebox';
import { JwtAuthGuard } from '../auth/jwtAuthGuard';
import { AllowScopes } from '../auth/scopesAuthGuard';
import { ADMIN_CLAIMS } from '../user/userService';
import {
  ApiClientCreateResponseSchema,
  CreateApiClientBody,
  CreateApiClientBodySchema
} from '../auth/authService.interface';
import { idSchema, ProjectID, projectIdSchema } from 'src/appModule.interfaces';
import { ApiClientId, apiClientIdSchema, ApiClientModel } from './apiclientModel';
import { _IApiClientService, IApiClientService } from './apiClientService.interface';

type NewType = ApiClientModel;

@Controller(':projectKey/api-clients')
export class ApiClientController {
  constructor(
    private authService: AuthService,
    @Inject(_IApiClientService)
    private readonly service: IApiClientService
  ) {}

  // CREATE
  @Post()
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: ApiClientCreateResponseSchema,
    request: [
      {
        name: 'projectKey',
        type: 'param',
        schema: projectIdSchema
      },
      {
        type: 'body',
        schema: CreateApiClientBodySchema
      }
    ]
  })
  async create(
    projectKey: ProjectID,
    data: CreateApiClientBody,
    @Res({ passthrough: true }) res
  ) {
    const idData = await this.authService.createApiClient(data);
    res.status(HttpStatus.CREATED);
    return idData;
  }

  // GET
  @Get(':id')
  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Validate({
    response: ApiClientCreateResponseSchema,
    request: [
      {
        name: 'projectKey',
        type: 'param',
        schema: projectIdSchema
      },
      {
        name: 'id',
        type: 'param',
        schema: apiClientIdSchema
      }
    ]
  })
  async get(projectKey: ProjectID, id: ApiClientId): Promise<ApiClientModel> {
    return await this.service.findByClientId(id);
  }

  // }
}
