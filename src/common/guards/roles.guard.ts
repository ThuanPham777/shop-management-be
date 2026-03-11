import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessException } from '../exceptions/business.exception.js';
import { ErrorCode } from '../constants/error-codes.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const hasRole = requiredRoles.some((role) => user?.roles?.includes(role));

    if (!hasRole) {
      throw new BusinessException(
        ErrorCode.AUTH_FORBIDDEN,
        'Bạn không có quyền thực hiện thao tác này',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
