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
@UseGuards(JwtAuthGuard)
export class WorkRequestController {
  constructor(private readonly workRequestService: WorkRequestService) {}

  // Freelancer sends a work request
  @Post()
  @UseGuards(RolesGuard)
  @Roles('freelancer')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Gửi yêu cầu làm việc thành công')
  createFreelancerRequest(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateWorkRequestDto,
  ) {
    return this.workRequestService.createFreelancerRequest(user.id, dto);
  }

  // Freelancer views all work requests
  @Get()
  @UseGuards(RolesGuard)
  @Roles('freelancer')
  @ResponseMessage('Lấy danh sách yêu cầu thành công')
  getFreelancerWorkRequests(@CurrentUser() user: { id: string }) {
    return this.workRequestService.getFreelancerWorkRequests(user.id);
  }

  // Freelancer responds to an owner proposal
  @Put(':id/respond')
  @UseGuards(RolesGuard)
  @Roles('freelancer')
  @ResponseMessage('Phản hồi yêu cầu thành công')
  respondToOwnerProposal(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RespondWorkRequestDto,
  ) {
    return this.workRequestService.respondToOwnerProposal(
      user.id,
      id,
      dto.action,
    );
  }
}
