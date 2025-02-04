import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClsService } from 'nestjs-cls';
import { PROJECT } from './authService';

@Injectable()
export class ApiClientAuthGuard extends AuthGuard('api-client') {}
