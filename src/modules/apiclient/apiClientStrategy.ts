import { BasicStrategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/authService';

@Injectable()
export class ApiClientStrategy extends PassportStrategy(BasicStrategy, 'api-client') {
  constructor(private authService: AuthService) {
    super({ realm: 'API Client' });
  }

  async validate(clientId: string, clientSecret: string): Promise<any> {
    const apiClient = await this.authService.validateApiClient(clientId, clientSecret);
    if (!apiClient) {
      throw new UnauthorizedException();
    }
    return { clientId: apiClient.id, claims: apiClient.scopes };
  }
}
