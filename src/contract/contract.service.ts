import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import {
  Contract,
  FreelancerProfile,
  OwnerProfile,
  Shop,
} from '../entities/index.js';
import { ContractResponseDto } from './dto/index.js';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
    @InjectRepository(OwnerProfile)
    private readonly ownerProfileRepository: Repository<OwnerProfile>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  private toResponseDto(contract: Contract): ContractResponseDto {
    const dto: ContractResponseDto = {
      id: contract.id,
      freelancer_id: contract.freelancer_id,
      shop_id: contract.shop_id,
      work_request_id: contract.work_request_id,
      status: contract.status,
      started_at: contract.started_at,
      ended_at: contract.ended_at,
      terminated_by: contract.terminated_by,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
    };

    if (contract.shop) {
      dto.shop = {
        id: contract.shop.id,
        name: contract.shop.name,
        logo_url: contract.shop.logo_url,
        phone: contract.shop.phone,
        email: contract.shop.email,
      };
    }

    if (contract.freelancer?.user) {
      dto.freelancer = {
        id: contract.freelancer.id,
        full_name: contract.freelancer.user.full_name,
        phone: contract.freelancer.user.phone,
        email: contract.freelancer.user.email,
        avatar_url: contract.freelancer.user.avatar_url,
      };
    }

    return dto;
  }

  // List contracts for the logged-in user (both roles)
  async getContracts(
    userId: string,
    roles: string[],
  ): Promise<ContractResponseDto[]> {
    const conditions: { freelancer_id?: string; shop_id?: any } = {};

    if (roles.includes('freelancer')) {
      const profile = await this.freelancerProfileRepository.findOne({
        where: { user_id: userId },
      });
      if (profile) {
        conditions.freelancer_id = profile.id;
      }
    }

    if (roles.includes('shop_owner')) {
      const ownerProfile = await this.ownerProfileRepository.findOne({
        where: { user_id: userId },
      });
      if (ownerProfile) {
        const shops = await this.shopRepository.find({
          where: { owner_id: ownerProfile.id },
          select: ['id'],
        });
        if (shops.length > 0) {
          conditions.shop_id = In(shops.map((s) => s.id));
        }
      }
    }

    // No matching profile found for any role
    if (!conditions.freelancer_id && !conditions.shop_id) {
      return [];
    }

    // Build where clauses — if user has both roles, combine with OR
    const where: any[] = [];
    if (conditions.freelancer_id) {
      where.push({ freelancer_id: conditions.freelancer_id });
    }
    if (conditions.shop_id) {
      where.push({ shop_id: conditions.shop_id });
    }

    const contracts = await this.contractRepository.find({
      where,
      relations: ['shop', 'freelancer', 'freelancer.user'],
      order: { created_at: 'DESC' },
    });

    return contracts.map((c) => this.toResponseDto(c));
  }

  // View contract detail
  async getContract(
    userId: string,
    roles: string[],
    contractId: string,
  ): Promise<ContractResponseDto> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
      relations: ['shop', 'freelancer', 'freelancer.user'],
    });

    if (!contract) {
      throw new BusinessException(
        ErrorCode.CONTRACT_NOT_FOUND,
        'Hợp đồng không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify the user owns this contract (either as freelancer or shop owner)
    let hasAccess = false;

    if (roles.includes('freelancer')) {
      const profile = await this.freelancerProfileRepository.findOne({
        where: { user_id: userId },
      });
      if (profile && contract.freelancer_id === profile.id) {
        hasAccess = true;
      }
    }

    if (!hasAccess && roles.includes('shop_owner')) {
      const ownerProfile = await this.ownerProfileRepository.findOne({
        where: { user_id: userId },
      });
      if (ownerProfile) {
        const shop = await this.shopRepository.findOne({
          where: { id: contract.shop_id, owner_id: ownerProfile.id },
        });
        if (shop) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      throw new BusinessException(
        ErrorCode.CONTRACT_NOT_FOUND,
        'Hợp đồng không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.toResponseDto(contract);
  }
}
