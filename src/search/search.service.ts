import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { OwnerProfile, Shop, User } from '../entities/index.js';
import {
  SearchFreelancerResponseDto,
  SearchShopResponseDto,
} from './dto/index.js';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(OwnerProfile)
    private readonly ownerProfileRepository: Repository<OwnerProfile>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async searchShopsByOwnerCode(
    ownerCode: string,
  ): Promise<SearchShopResponseDto[]> {
    const ownerProfile = await this.ownerProfileRepository.findOne({
      where: { unique_code: ownerCode },
    });

    if (!ownerProfile) {
      return [];
    }

    const shops = await this.shopRepository.find({
      where: { owner_id: ownerProfile.id },
      order: { created_at: 'DESC' },
    });

    return shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      logo_url: shop.logo_url,
      house_number: shop.house_number,
      street: shop.street,
      ward: shop.ward,
      district: shop.district,
      province: shop.province,
      phone: shop.phone,
      email: shop.email,
    }));
  }

  async searchFreelancersByPhone(
    phone: string,
  ): Promise<SearchFreelancerResponseDto[]> {
    const users = await this.userRepository.find({
      where: { phone },
      relations: ['freelancer_profile'],
    });

    const freelancers = users.filter((u) => u.freelancer_profile !== null);

    return freelancers.map((user) => ({
      id: user.freelancer_profile.id,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
      avatar_url: user.avatar_url,
      gender: user.gender,
    }));
  }
}
