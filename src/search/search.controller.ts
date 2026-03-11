import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { ErrorCode } from '../common/constants/error-codes.js';
import { SearchService } from './search.service.js';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('shops')
  @UseGuards(RolesGuard)
  @Roles('freelancer')
  @ResponseMessage('Tìm kiếm cửa hàng thành công')
  searchShops(@Query('ownerCode') ownerCode: string) {
    if (!ownerCode) {
      throw new BusinessException(
        ErrorCode.VALIDATION_ERROR,
        'ownerCode là bắt buộc',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.searchService.searchShopsByOwnerCode(ownerCode);
  }

  @Get('freelancers')
  @UseGuards(RolesGuard)
  @Roles('shop_owner')
  @ResponseMessage('Tìm kiếm freelancer thành công')
  searchFreelancers(@Query('phone') phone: string) {
    if (!phone) {
      throw new BusinessException(
        ErrorCode.VALIDATION_ERROR,
        'phone là bắt buộc',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.searchService.searchFreelancersByPhone(phone);
  }
}
