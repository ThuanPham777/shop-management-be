import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import {
  Contract,
  FreelancerProfile,
  Shop,
  WorkRequest,
} from '../entities/index.js';
import { CreateWorkRequestDto, WorkRequestResponseDto } from './dto/index.js';

@Injectable()
export class WorkRequestService {
  constructor(
    @InjectRepository(WorkRequest)
    private readonly workRequestRepository: Repository<WorkRequest>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveFreelancerProfile(
    userId: string,
  ): Promise<FreelancerProfile> {
    const profile = await this.freelancerProfileRepository.findOne({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'Không tìm thấy hồ sơ freelancer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return profile;
  }

  private toResponseDto(wr: WorkRequest): WorkRequestResponseDto {
    const dto: WorkRequestResponseDto = {
      id: wr.id,
      freelancer_id: wr.freelancer_id,
      shop_id: wr.shop_id,
      type: wr.type,
      status: wr.status,
      created_at: wr.created_at,
      updated_at: wr.updated_at,
    };

    if (wr.shop) {
      dto.shop = {
        id: wr.shop.id,
        name: wr.shop.name,
        logo_url: wr.shop.logo_url,
        phone: wr.shop.phone,
        email: wr.shop.email,
      };
    }

    return dto;
  }

  // Freelancer sends a work request to a shop
  async createFreelancerRequest(
    userId: string,
    dto: CreateWorkRequestDto,
  ): Promise<WorkRequestResponseDto> {
    const freelancerProfile = await this.resolveFreelancerProfile(userId);

    const shop = await this.shopRepository.findOne({
      where: { id: dto.shop_id },
    });

    if (!shop) {
      throw new BusinessException(
        ErrorCode.SHOP_NOT_FOUND,
        'Cửa hàng không tồn tại',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check for existing active contract
    const activeContract = await this.contractRepository.findOne({
      where: {
        freelancer_id: freelancerProfile.id,
        shop_id: dto.shop_id,
        status: 'active',
      },
    });

    if (activeContract) {
      throw new BusinessException(
        ErrorCode.CONTRACT_ALREADY_ACTIVE,
        'Bạn đã có hợp đồng đang hoạt động với cửa hàng này',
        HttpStatus.CONFLICT,
      );
    }

    // Check for existing pending work request
    const pendingRequest = await this.workRequestRepository.findOne({
      where: {
        freelancer_id: freelancerProfile.id,
        shop_id: dto.shop_id,
        status: 'pending',
      },
    });

    if (pendingRequest) {
      throw new BusinessException(
        ErrorCode.WORK_REQUEST_INVALID,
        'Đã có yêu cầu đang chờ xử lý với cửa hàng này',
        HttpStatus.CONFLICT,
      );
    }

    const workRequest = this.workRequestRepository.create({
      freelancer_id: freelancerProfile.id,
      shop_id: dto.shop_id,
      type: 'freelancer_request',
      status: 'pending',
    });

    const saved = await this.workRequestRepository.save(workRequest);
    saved.shop = shop;
    return this.toResponseDto(saved);
  }

  // Freelancer views all sent requests and received proposals
  async getFreelancerWorkRequests(
    userId: string,
  ): Promise<WorkRequestResponseDto[]> {
    const freelancerProfile = await this.resolveFreelancerProfile(userId);

    const workRequests = await this.workRequestRepository.find({
      where: { freelancer_id: freelancerProfile.id },
      relations: ['shop'],
      order: { created_at: 'DESC' },
    });

    return workRequests.map((wr) => this.toResponseDto(wr));
  }

  // Freelancer responds to an owner proposal
  async respondToOwnerProposal(
    userId: string,
    workRequestId: string,
    action: 'accepted' | 'rejected',
  ): Promise<WorkRequestResponseDto> {
    const freelancerProfile = await this.resolveFreelancerProfile(userId);

    const workRequest = await this.workRequestRepository.findOne({
      where: {
        id: workRequestId,
        freelancer_id: freelancerProfile.id,
        type: 'owner_proposal',
        status: 'pending',
      },
      relations: ['shop'],
    });

    if (!workRequest) {
      throw new BusinessException(
        ErrorCode.WORK_REQUEST_NOT_FOUND,
        'Yêu cầu không tồn tại hoặc đã được xử lý',
        HttpStatus.NOT_FOUND,
      );
    }

    if (action === 'accepted') {
      // Transaction: update work request status + create contract
      const updated = await this.dataSource.transaction(async (manager) => {
        workRequest.status = 'accepted';
        const saved = await manager.save(WorkRequest, workRequest);

        await manager.save(
          Contract,
          manager.create(Contract, {
            freelancer_id: freelancerProfile.id,
            shop_id: workRequest.shop_id,
            work_request_id: workRequest.id,
            status: 'active',
          }),
        );

        return saved;
      });

      return this.toResponseDto(updated);
    }

    workRequest.status = 'rejected';
    const saved = await this.workRequestRepository.save(workRequest);
    return this.toResponseDto(saved);
  }
}
