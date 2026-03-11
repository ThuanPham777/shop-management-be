import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { ContractService } from './contract.service.js';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('freelancer', 'shop_owner')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  // List contracts
  @Get()
  @ResponseMessage('Lấy danh sách hợp đồng thành công')
  getContracts(@CurrentUser() user: { id: string; roles: string[] }) {
    return this.contractService.getContracts(user.id, user.roles);
  }

  // View contract detail
  @Get(':id')
  @ResponseMessage('Lấy thông tin hợp đồng thành công')
  getContract(
    @CurrentUser() user: { id: string; roles: string[] },
    @Param('id') id: string,
  ) {
    return this.contractService.getContract(user.id, user.roles, id);
  }
}
