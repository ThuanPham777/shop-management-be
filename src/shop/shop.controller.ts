import {
  Body,
  Controller,
  Delete,
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
import { CreateShopRequestDto, UpdateShopRequestDto } from './dto/index.js';
import { ShopService } from './shop.service.js';

@Controller('shops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('shop_owner')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Tạo cửa hàng thành công')
  createShop(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateShopRequestDto,
  ) {
    return this.shopService.createShop(user.id, dto);
  }

  @Get()
  @ResponseMessage('Lấy danh sách cửa hàng thành công')
  getShops(@CurrentUser() user: { id: string }) {
    return this.shopService.getShops(user.id);
  }

  @Get(':shopId')
  @ResponseMessage('Lấy thông tin cửa hàng thành công')
  getShop(
    @CurrentUser() user: { id: string },
    @Param('shopId') shopId: string,
  ) {
    return this.shopService.getShop(user.id, shopId);
  }

  @Put(':shopId')
  @ResponseMessage('Cập nhật cửa hàng thành công')
  updateShop(
    @CurrentUser() user: { id: string },
    @Param('shopId') shopId: string,
    @Body() dto: UpdateShopRequestDto,
  ) {
    return this.shopService.updateShop(user.id, shopId, dto);
  }

  @Delete(':shopId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xóa cửa hàng thành công')
  deleteShop(
    @CurrentUser() user: { id: string },
    @Param('shopId') shopId: string,
  ) {
    return this.shopService.deleteShop(user.id, shopId);
  }
}
