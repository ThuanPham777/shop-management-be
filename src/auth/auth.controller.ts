import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { AuthService } from './auth.service.js';
import {
  LoginRequestDto,
  RegisterRequestDto,
  VerifyEmailRequestDto,
} from './dto/index.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { ErrorCode } from '../common/constants/error-codes.js';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  private readonly cookieOptions: CookieOptions;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const refreshDays = this.configService.get<number>(
      'JWT_REFRESH_EXPIRES_DAYS',
      7,
    );

    this.cookieOptions = {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: refreshDays * 24 * 60 * 60 * 1000,
    };
  }

  @Post('register')
  @ResponseMessage(
    'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
  )
  register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Xác thực email thành công')
  verifyEmail(@Body() dto: VerifyEmailRequestDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { response, rawRefreshToken } = await this.authService.login(dto);

    res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, this.cookieOptions);

    return response;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Đăng xuất thành công')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_INVALID,
        'Refresh token không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.authService.logout(refreshToken);

    res.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_INVALID,
        'Refresh token không tồn tại',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { response, rawRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE, rawRefreshToken, this.cookieOptions);

    return response;
  }
}
