import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerProfile, Shop } from '../entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ShopController } from './shop.controller.js';
import { ShopService } from './shop.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, OwnerProfile]), AuthModule],
  controllers: [ShopController],
  providers: [ShopService, RolesGuard],
})
export class ShopModule {}
