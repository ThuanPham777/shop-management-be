import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { Contract, OwnerProfile, Shop } from '../entities/index.js';
import { EmployeeResponseDto } from './dto/index.js';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(OwnerProfile)
    private readonly ownerProfileRepository: Repository<OwnerProfile>,
  ) {}

  private async findOwnedShop(userId: string, shopId: string): Promise<Shop> {
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

    const shop = await this.shopRepository.findOne({
      where: { id: shopId, owner_id: ownerProfile.id },
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

  async getEmployees(
    userId: string,
    shopId: string,
  ): Promise<EmployeeResponseDto[]> {
    await this.findOwnedShop(userId, shopId);

    const contracts = await this.contractRepository.find({
      where: { shop_id: shopId, status: 'active' },
      relations: ['freelancer', 'freelancer.user'],
      order: { started_at: 'DESC' },
    });

    return contracts.map((contract) => ({
      contract_id: contract.id,
      freelancer_id: contract.freelancer_id,
      full_name: contract.freelancer.user.full_name,
      phone: contract.freelancer.user.phone,
      email: contract.freelancer.user.email,
      avatar_url: contract.freelancer.user.avatar_url,
      status: contract.status,
      started_at: contract.started_at,
    }));
  }

  async terminateEmployee(
    userId: string,
    shopId: string,
    contractId: string,
  ): Promise<void> {
    await this.findOwnedShop(userId, shopId);

    const contract = await this.contractRepository.findOne({
      where: { id: contractId, shop_id: shopId, status: 'active' },
    });

    if (!contract) {
      throw new BusinessException(
        ErrorCode.CONTRACT_NOT_FOUND,
        'Hợp đồng không tồn tại hoặc đã kết thúc',
        HttpStatus.NOT_FOUND,
      );
    }

    contract.status = 'terminated';
    contract.ended_at = new Date();
    contract.terminated_by = userId;
    await this.contractRepository.save(contract);
  }
}
