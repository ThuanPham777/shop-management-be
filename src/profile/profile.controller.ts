import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UpdateProfileRequestDto } from './dto/index.js';
import { ProfileService } from './profile.service.js';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ResponseMessage('Lấy thông tin hồ sơ thành công')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  @ResponseMessage('Cập nhật hồ sơ thành công')
  updateProfile(
    @CurrentUser() user: { id: string; roles: string[] },
    @Body() dto: UpdateProfileRequestDto,
  ) {
    return this.profileService.updateProfile(user.id, user.roles, dto);
  }
}
