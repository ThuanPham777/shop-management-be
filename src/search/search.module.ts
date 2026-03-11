import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerProfile, Shop, User } from '../entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerProfile, Shop, User]), AuthModule],
  controllers: [SearchController],
  providers: [SearchService, RolesGuard],
})
export class SearchModule {}
