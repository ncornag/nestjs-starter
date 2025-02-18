import { forwardRef, Module } from '@nestjs/common';
import { OrgController } from './orgController';
import { OrgService } from './orgService';
import { _IOrgService } from './orgService.interface';
import { OrgRepository } from './orgRepository';
import { _IOrgRepository } from './orgRepository.interface';
import { DatabaseModule } from 'src/infrastructure/db/dbModule';
import { AuthModule } from '../auth/authModule';

@Module({
  imports: [forwardRef(() => AuthModule), DatabaseModule],
  controllers: [OrgController],
  providers: [
    {
      provide: _IOrgService,
      useClass: OrgService
    },
    {
      provide: _IOrgRepository,
      useClass: OrgRepository
    }
  ],
  exports: [_IOrgService]
})
export class OrgModule {}
