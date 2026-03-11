import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { FreelancerProfile, OwnerProfile, User } from '../entities/index.js';
import { ProfileResponseDto, UpdateProfileRequestDto } from './dto/index.js';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OwnerProfile)
    private readonly ownerProfileRepository: Repository<OwnerProfile>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
  ) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'full_name',
        'email',
        'phone',
        'date_of_birth',
        'avatar_url',
        'gender',
      ],
      relations: [
        'user_roles',
        'user_roles.role',
        'owner_profile',
        'freelancer_profile',
      ],
    });

    if (!user) {
      throw new BusinessException(
        ErrorCode.USER_NOT_FOUND,
        'Người dùng không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    const roles = user.user_roles.map((ur) => ur.role.name);

    const response: ProfileResponseDto = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split('T')[0]
        : null,
      avatar_url: user.avatar_url,
      gender: user.gender,
      roles,
    };

    if (user.owner_profile) {
      response.owner_profile = {
        unique_code: user.owner_profile.unique_code,
      };
    }

    if (user.freelancer_profile) {
      response.freelancer_profile = {
        house_number: user.freelancer_profile.house_number,
        street: user.freelancer_profile.street,
        ward: user.freelancer_profile.ward,
        district: user.freelancer_profile.district,
        province: user.freelancer_profile.province,
      };
    }

    return response;
  }

  async updateProfile(
    userId: string,
    roles: string[],
    dto: UpdateProfileRequestDto,
  ): Promise<ProfileResponseDto> {
    const { house_number, street, ward, district, province, ...userFields } =
      dto;

    // Update user fields if any provided
    if (Object.keys(userFields).length > 0) {
      await this.userRepository.update(userId, userFields);
    }

    // Update freelancer address fields if user is a freelancer
    const hasAddressFields =
      house_number !== undefined ||
      street !== undefined ||
      ward !== undefined ||
      district !== undefined ||
      province !== undefined;

    if (hasAddressFields) {
      if (!roles.includes('freelancer')) {
        throw new BusinessException(
          ErrorCode.AUTH_FORBIDDEN,
          'Chỉ freelancer mới có thể cập nhật địa chỉ',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.freelancerProfileRepository.update(
        { user_id: userId },
        { house_number, street, ward, district, province },
      );
    }

    return this.getProfile(userId);
  }
}
