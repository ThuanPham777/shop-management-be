import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes.js';
import { BusinessException } from '../exceptions/business.exception.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorCode = this.extractErrorCode(exception, status);
    const message = this.extractMessage(exception);
    const errors = this.extractErrors(exception);

    const errorResponse: Record<string, unknown> = {
      success: false,
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errors) {
      errorResponse.errors = errors;
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - [${errorCode}] ${message}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private extractErrorCode(exception: unknown, status: number): ErrorCode {
    if (exception instanceof BusinessException) {
      return exception.errorCode;
    }

    if (status === HttpStatus.BAD_REQUEST) return ErrorCode.VALIDATION_ERROR;
    if (status === HttpStatus.UNAUTHORIZED) return ErrorCode.AUTH_UNAUTHORIZED;
    if (status === HttpStatus.FORBIDDEN) return ErrorCode.AUTH_FORBIDDEN;

    return ErrorCode.INTERNAL_ERROR;
  }

  private extractMessage(exception: unknown): string {
    if (exception instanceof BusinessException) {
      const res = exception.getResponse() as Record<string, unknown>;
      return res.message as string;
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') return res;
      return (
        ((res as Record<string, unknown>).error as string) || exception.message
      );
    }

    return 'Internal server error';
  }

  private extractErrors(exception: unknown): string[] | null {
    if (
      exception instanceof HttpException &&
      !(exception instanceof BusinessException)
    ) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const msg = (res as Record<string, unknown>).message;
        if (Array.isArray(msg)) return msg;
      }
    }
    return null;
  }
}
