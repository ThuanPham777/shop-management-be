import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { EmployeeService } from './employee.service.js';

@Controller('shops/:shopId/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('shop_owner')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ResponseMessage('Lấy danh sách nhân viên thành công')
  getEmployees(
    @CurrentUser() user: { id: string },
    @Param('shopId') shopId: string,
  ) {
    return this.employeeService.getEmployees(user.id, shopId);
  }

  @Delete(':contractId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Chấm dứt hợp đồng thành công')
  terminateEmployee(
    @CurrentUser() user: { id: string },
    @Param('shopId') shopId: string,
    @Param('contractId') contractId: string,
  ) {
    return this.employeeService.terminateEmployee(user.id, shopId, contractId);
  }
}
