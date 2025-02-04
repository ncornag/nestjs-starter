import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
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
import {
  ProjectID,
  projectIdSchema,
  ProjectKey,
  projectKeySchema
} from 'src/appModule.interfaces';
import { ApiClientId, apiClientIdSchema, ApiClientModel } from './apiclientModel';
import { _IApiClientService, IApiClientService } from './apiClientService.interface';
import { ApiClientAuthGuard } from '../auth/apiClientAuthGuard';
import { ProjectAuthGuard } from '../auth/projectAuthGuard';

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
        schema: projectKeySchema
      },
      {
        type: 'body',
        schema: CreateApiClientBodySchema
      }
    ]
  })
  async create(
    projectKey: ProjectKey,
    data: CreateApiClientBody,
    @Res({ passthrough: true }) res
  ) {
    const idData = await this.authService.createApiClient(projectKey, data);
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
        schema: projectKeySchema
      },
      {
        name: 'id',
        type: 'param',
        schema: apiClientIdSchema
      }
    ]
  })
  async get(projectKey: ProjectID, id: ApiClientId): Promise<ApiClientModel> {
    return await this.service.findByClientId(projectKey, id);
  }

  @UseGuards(ProjectAuthGuard, ApiClientAuthGuard)
  @Post('token')
  async token(@Request() req, @Res({ passthrough: true }) res) {
    const tokenData = await this.authService.createApiToken(req.body?.scopes ?? [], req.user);
    res.status(HttpStatus.OK);
    return tokenData;
  }
}
