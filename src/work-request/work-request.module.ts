import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Contract,
  FreelancerProfile,
  Shop,
  WorkRequest,
} from '../entities/index.js';
import { AuthModule } from '../auth/auth.module.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { WorkRequestController } from './work-request.controller.js';
import { WorkRequestService } from './work-request.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkRequest, FreelancerProfile, Shop, Contract]),
    AuthModule,
  ],
  controllers: [WorkRequestController],
  providers: [WorkRequestService, RolesGuard],
  exports: [WorkRequestService],
})
export class WorkRequestModule {}
