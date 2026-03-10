export enum ErrorCode {
  // ============================
  // Auth
  // ============================
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',

  // ============================
  // User
  // ============================
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',

  // ============================
  // Shop
  // ============================
  SHOP_NOT_FOUND = 'SHOP_NOT_FOUND',

  // ============================
  // Contract
  // ============================
  CONTRACT_ALREADY_ACTIVE = 'CONTRACT_ALREADY_ACTIVE',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',

  // ============================
  // Work Request
  // ============================
  WORK_REQUEST_NOT_FOUND = 'WORK_REQUEST_NOT_FOUND',
  WORK_REQUEST_INVALID = 'WORK_REQUEST_INVALID',

  // ============================
  // Common
  // ============================
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
