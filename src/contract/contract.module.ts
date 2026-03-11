import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Contract,
  FreelancerProfile,
  OwnerProfile,
  Shop,
} from '../entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ContractController } from './contract.controller.js';
import { ContractService } from './contract.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, FreelancerProfile, OwnerProfile, Shop]),
    AuthModule,
  ],
  controllers: [ContractController],
  providers: [ContractService, RolesGuard],
})
export class ContractModule {}
