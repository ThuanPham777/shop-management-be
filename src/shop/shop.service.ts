import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { OwnerProfile, Shop } from '../entities/index.js';
import {
  CreateShopRequestDto,
  ShopResponseDto,
  UpdateShopRequestDto,
} from './dto/index.js';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(OwnerProfile)
    private readonly ownerProfileRepository: Repository<OwnerProfile>,
  ) {}

  /**
   * Resolve the owner profile for the given user.
   * Throws an exception if the user does not have an owner profile.
   */
  private async resolveOwnerProfile(userId: string): Promise<OwnerProfile> {
    const ownerProfile = await this.ownerProfileRepository.findOne({
      where: { user_id: userId },
    });

    if (!ownerProfile) {
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Không tìm thấy hồ sơ chủ cửa hàng',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ownerProfile;
  }

  // Single ownership-verification query reused across get/update/delete.
  private async findOwnedShop(
    ownerProfileId: string,
    shopId: string,
  ): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId, owner_id: ownerProfileId },
    });

    if (!shop) {
      throw new BusinessException(
        ErrorCode.SHOP_NOT_FOUND,
        'Cửa hàng không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    return shop;
  }

  private toResponseDto(shop: Shop): ShopResponseDto {
    return {
      id: shop.id,
      owner_id: shop.owner_id,
      name: shop.name,
      logo_url: shop.logo_url,
      house_number: shop.house_number,
      street: shop.street,
      ward: shop.ward,
      district: shop.district,
      province: shop.province,
      phone: shop.phone,
      email: shop.email,
      created_at: shop.created_at,
      updated_at: shop.updated_at,
    };
  }

  async createShop(
    userId: string,
    dto: CreateShopRequestDto,
  ): Promise<ShopResponseDto> {
    const ownerProfile = await this.resolveOwnerProfile(userId);

    const shop = this.shopRepository.create({
      ...dto,
      owner_id: ownerProfile.id,
    });

    const saved = await this.shopRepository.save(shop);
    return this.toResponseDto(saved);
  }

  async getShops(userId: string): Promise<ShopResponseDto[]> {
    const ownerProfile = await this.resolveOwnerProfile(userId);

    const shops = await this.shopRepository.find({
      where: { owner_id: ownerProfile.id },
      order: { created_at: 'DESC' },
    });

    return shops.map((shop) => this.toResponseDto(shop));
  }

  async getShop(userId: string, shopId: string): Promise<ShopResponseDto> {
    const ownerProfile = await this.resolveOwnerProfile(userId);
    const shop = await this.findOwnedShop(ownerProfile.id, shopId);
    return this.toResponseDto(shop);
  }

  async updateShop(
    userId: string,
    shopId: string,
    dto: UpdateShopRequestDto,
  ): Promise<ShopResponseDto> {
    const ownerProfile = await this.resolveOwnerProfile(userId);
    const shop = await this.findOwnedShop(ownerProfile.id, shopId);

    Object.assign(shop, dto);
    const updated = await this.shopRepository.save(shop);
    return this.toResponseDto(updated);
  }

  async deleteShop(userId: string, shopId: string): Promise<void> {
    const ownerProfile = await this.resolveOwnerProfile(userId);
    await this.findOwnedShop(ownerProfile.id, shopId);
    await this.shopRepository.softDelete(shopId);
  }
}
