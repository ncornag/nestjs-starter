import { forwardRef, Module } from '@nestjs/common';
import { _IApiClientService } from './apiClientService.interface';
import { _IApiClientRepository } from './apiClientRepository.interface';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { ApiClientService } from './apiClientService';
import { ApiClientRepository } from './apiClientRepository';
import { ProjectModule } from '../project/projectModule';

@Module({
  imports: [DatabaseModule, forwardRef(() => ProjectModule)],
  providers: [
    {
      provide: _IApiClientService,
      useClass: ApiClientService
    },
    {
      provide: _IApiClientRepository,
      useClass: ApiClientRepository
    }
  ],
  exports: [_IApiClientService]
})
export class ApiClientModule {}
