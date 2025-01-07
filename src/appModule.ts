import { Module } from '@nestjs/common';
import { ProjectModule } from './modules/project/projectModule';

@Module({
  imports: [ProjectModule]
})
export class AppModule {}
