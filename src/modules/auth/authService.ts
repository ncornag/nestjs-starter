import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/userService';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { _IUserService, CreateUserBody } from '../user/userService.interface';
import { ConfigService } from '@nestjs/config';
import { _IApiClientService } from '../apiclient/apiClientService.interface';
import { ApiClientService } from '../apiclient/apiClientService';
import {
  ApiClientCreateResponse,
  ApiClientResponse,
  CreateApiClientBody,
  IAuthService
} from './authService.interface';
import { IDWithVersion } from 'src/appModule.interfaces';
import { ClsService } from 'nestjs-cls';
import { PROJECT_TAG } from './scopesAuthGuard';

export const USER = 'user';
export const PROJECT = 'project';

@Injectable()
export class AuthService implements IAuthService {
  private passSaltRounds: number;
  constructor(
    private readonly cls: ClsService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(_IUserService)
    private usersService: UserService,
    @Inject(_IApiClientService)
    private apiClientService: ApiClientService
  ) {
    this.passSaltRounds = configService.get<number>('PASSWORD_SALT_ROUNDS');
  }

  private generateClientId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateClientSecret(): string {
    return crypto.randomBytes(64).toString('base64');
  }

  // Used in the localStrategy
  async validateUser(username: string, incommingPassword: string): Promise<any | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return;
    const validPassword = await bcrypt.compare(incommingPassword, user.password);
    if (!validPassword) return;
    const { password, ...result } = user;
    return result;
  }

  async signUp(data: CreateUserBody): Promise<IDWithVersion> {
    const hash = await bcrypt.hash(data.password, this.passSaltRounds);
    return await this.usersService.create({ ...data, password: hash });
  }

  async login(user: any): Promise<{ access_token: string }> {
    const payload = { sub: user.id, claims: [...user.roles] };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }

  async createApiClient(data: CreateApiClientBody): Promise<ApiClientCreateResponse> {
    const projectKey = this.cls.get(PROJECT).key;
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();
    const clientSecretHash = await bcrypt.hash(clientSecret, this.passSaltRounds);
    const apiClient: any = {
      ...data,
      clientId,
      clientSecret: clientSecretHash,
      scopes: [...data.scopes, `${PROJECT_TAG}:${projectKey}`],
      isActive: true
    };
    await this.apiClientService.create(apiClient);
    apiClient.clientSecret = clientSecret; // Show it only once
    return apiClient;
  }

  async validateApiClient(
    clientId: string,
    incommingClientSecret: string
  ): Promise<ApiClientResponse | null> {
    const apiClient = await this.apiClientService.findByClientId(clientId);
    if (!apiClient || !apiClient.isActive) return;
    const validSecret = await bcrypt.compare(incommingClientSecret, apiClient.clientSecret);
    if (!validSecret) return;
    const { clientSecret, ...result } = apiClient;
    return result;
  }
}
