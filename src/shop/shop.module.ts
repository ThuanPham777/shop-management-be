import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract, OwnerProfile, Shop } from '../entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ShopController } from './shop.controller.js';
import { ShopService } from './shop.service.js';
import { EmployeeController } from './employee.controller.js';
import { EmployeeService } from './employee.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, OwnerProfile, Contract]),
    AuthModule,
  ],
  controllers: [ShopController, EmployeeController],
  providers: [ShopService, EmployeeService, RolesGuard],
})
export class ShopModule {}
