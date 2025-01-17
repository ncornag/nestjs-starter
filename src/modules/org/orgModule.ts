import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infrastructure/databaseModule';
import { OrgController } from './orgController';
import { OrgService } from './orgService';
import { _IOrgService } from './orgService.interface';
import { OrgRepository } from './orgRepository';
import { _IOrgRepository } from './orgRepository.interface';

@Module({
  imports: [DatabaseModule],
  controllers: [OrgController],
  providers: [
    OrgService,
    {
      provide: _IOrgService,
      useClass: OrgService
    },
    {
      provide: _IOrgRepository,
      useClass: OrgRepository
    }
  ],
  exports: [OrgService]
})
export class OrgModule {}
