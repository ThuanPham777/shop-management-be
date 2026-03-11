import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { ErrorCode } from '../common/constants/error-codes.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import {
  FreelancerProfile,
  OwnerProfile,
  RefreshToken,
  Role,
  User,
  UserRole,
} from '../entities/index.js';
import {
  LoginRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
} from './dto/index.js';

const BCRYPT_SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_BYTES = 32;
const REFRESH_TOKEN_BYTES = 40;
const UNIQUE_CODE_BYTES = 4;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
      select: ['id'],
    });

    if (existingUser) {
      throw new BusinessException(
        ErrorCode.USER_ALREADY_EXISTS,
        'Email hoặc số điện thoại đã được sử dụng',
        HttpStatus.CONFLICT,
      );
    }

    const role = await this.roleRepository.findOne({
      where: { name: dto.role },
      select: ['id'],
    });

    if (!role) {
      throw new BusinessException(
        ErrorCode.VALIDATION_ERROR,
        'Role không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const verificationToken = crypto
      .randomBytes(VERIFICATION_TOKEN_BYTES)
      .toString('hex');

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        password_hash: passwordHash,
        gender: dto.gender,
        is_email_verified: false,
        verification_token: verificationToken,
        token_expires_at: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      });

      const saved = await manager.save(User, user);

      await manager.save(
        UserRole,
        manager.create(UserRole, {
          user_id: saved.id,
          role_id: role.id,
        }),
      );

      if (dto.role === 'shop_owner') {
        await manager.save(
          OwnerProfile,
          manager.create(OwnerProfile, {
            user_id: saved.id,
            unique_code: this.generateUniqueCode(),
          }),
        );
      } else {
        await manager.save(
          FreelancerProfile,
          manager.create(FreelancerProfile, {
            user_id: saved.id,
          }),
        );
      }

      return saved;
    });

    // TODO: Send verification email with verificationToken

    return { verification_token: verificationToken };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { verification_token: token },
      select: ['id', 'is_email_verified', 'token_expires_at'],
    });

    if (!user) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_INVALID,
        'Token xác thực không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.token_expires_at && user.token_expires_at < new Date()) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_EXPIRED,
        'Token xác thực đã hết hạn',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userRepository.update(user.id, {
      is_email_verified: true,
      verification_token: null,
      token_expires_at: null,
    });
  }

  async login(
    dto: LoginRequestDto,
  ): Promise<{ response: LoginResponseDto; rawRefreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: [{ email: dto.login }, { phone: dto.login }],
      select: [
        'id',
        'full_name',
        'email',
        'phone',
        'password_hash',
        'is_email_verified',
      ],
      relations: ['user_roles', 'user_roles.role'],
    });

    if (!user) {
      throw new BusinessException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Email/SĐT hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new BusinessException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        'Email/SĐT hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.is_email_verified) {
      throw new BusinessException(
        ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
        'Vui lòng xác thực email trước khi đăng nhập',
        HttpStatus.FORBIDDEN,
      );
    }

    const roles = user.user_roles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    const response: LoginResponseDto = {
      access_token: tokens.accessToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        roles,
      },
    };

    return { response, rawRefreshToken: tokens.rawRefreshToken };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const hashedToken = this.hashToken(rawRefreshToken);

    const result = await this.refreshTokenRepository.update(
      { token: hashedToken, revoked: false },
      { revoked: true },
    );

    if (result.affected === 0) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_INVALID,
        'Refresh token không hợp lệ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refreshToken(
    rawRefreshToken: string,
  ): Promise<{ response: RefreshTokenResponseDto; rawRefreshToken: string }> {
    const hashedToken = this.hashToken(rawRefreshToken);

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: hashedToken, revoked: false },
      select: ['id', 'expires_at', 'user_id'],
    });

    if (!storedToken) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_INVALID,
        'Refresh token không hợp lệ hoặc đã bị thu hồi',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (storedToken.expires_at < new Date()) {
      // Revoke expired token as cleanup
      await this.refreshTokenRepository.update(storedToken.id, {
        revoked: true,
      });
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_EXPIRED,
        'Refresh token đã hết hạn',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Load user with roles in a separate optimized query
    const user = await this.userRepository.findOne({
      where: { id: storedToken.user_id },
      select: ['id', 'email'],
      relations: ['user_roles', 'user_roles.role'],
    });

    if (!user) {
      throw new BusinessException(
        ErrorCode.AUTH_TOKEN_INVALID,
        'Refresh token không hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Revoke old + create new atomically
    const roles = user.user_roles.map((ur) => ur.role.name);

    await this.refreshTokenRepository.update(storedToken.id, {
      revoked: true,
    });

    const tokens = await this.generateTokens(user.id, user.email, roles);

    return {
      response: { access_token: tokens.accessToken },
      rawRefreshToken: tokens.rawRefreshToken,
    };
  }

  private async generateTokens(userId: string, email: string, roles: string[]) {
    const accessToken = this.jwtService.sign({ sub: userId, email, roles }, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    } as JwtSignOptions);

    const rawRefreshToken = crypto
      .randomBytes(REFRESH_TOKEN_BYTES)
      .toString('hex');
    const hashedRefreshToken = this.hashToken(rawRefreshToken);

    const refreshExpiresIn = this.configService.get<number>(
      'JWT_REFRESH_EXPIRES_DAYS',
      7,
    );

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        user_id: userId,
        token: hashedRefreshToken,
        expires_at: new Date(
          Date.now() + refreshExpiresIn * 24 * 60 * 60 * 1000,
        ),
      }),
    );

    return { accessToken, rawRefreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateUniqueCode(): string {
    return crypto.randomBytes(UNIQUE_CODE_BYTES).toString('hex').toUpperCase();
  }
}
