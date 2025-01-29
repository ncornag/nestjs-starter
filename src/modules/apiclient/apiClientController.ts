import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { LocalAuthGuard } from '../auth/localAuthGuard';
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
import { ProjectID, projectIdSchema } from 'src/appModule.interfaces';

@Controller(':projectKey/api-clients')
export class ApiClientController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard, AllowScopes(ADMIN_CLAIMS))
  @Post()
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

  // @UseGuards(LocalAuthGuard)
  // @Post('login')
  // async login(@Request() req, @Res({ passthrough: true }) res) {
  //   const tokenData = await this.authService.login(req.user);
  //   res.status(HttpStatus.OK);
  //   return tokenData;
  // }
}
