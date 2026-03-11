import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { CreateWorkRequestDto, RespondWorkRequestDto } from './dto/index.js';
import { WorkRequestService } from './work-request.service.js';

@Controller('work-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('freelancer', 'shop_owner')
export class WorkRequestController {
  constructor(private readonly workRequestService: WorkRequestService) {}

  // Create a work request or proposal
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Gửi yêu cầu làm việc thành công')
  createWorkRequest(
    @CurrentUser() user: { id: string; roles: string[] },
    @Body() dto: CreateWorkRequestDto,
  ) {
    if (user.roles.includes('shop_owner')) {
      return this.workRequestService.createOwnerProposal(user.id, dto);
    }
    return this.workRequestService.createFreelancerRequest(user.id, dto);
  }

  // List all work requests
  @Get()
  @ResponseMessage('Lấy danh sách yêu cầu thành công')
  getWorkRequests(@CurrentUser() user: { id: string; roles: string[] }) {
    if (user.roles.includes('shop_owner')) {
      return this.workRequestService.getOwnerWorkRequests(user.id);
    }
    return this.workRequestService.getFreelancerWorkRequests(user.id);
  }

  // Respond to a work request
  @Put(':id/respond')
  @ResponseMessage('Phản hồi yêu cầu thành công')
  respondToWorkRequest(
    @CurrentUser() user: { id: string; roles: string[] },
    @Param('id') id: string,
    @Body() dto: RespondWorkRequestDto,
  ) {
    if (user.roles.includes('shop_owner')) {
      return this.workRequestService.respondToFreelancerRequest(
        user.id,
        id,
        dto.action,
      );
    }
    return this.workRequestService.respondToOwnerProposal(
      user.id,
      id,
      dto.action,
    );
  }
}
