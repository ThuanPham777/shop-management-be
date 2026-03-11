import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes.js';

export class BusinessException extends HttpException {
  public readonly errorCode: ErrorCode;

  constructor(
    errorCode: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ errorCode, message }, statusCode);
    this.errorCode = errorCode;
  }
}
