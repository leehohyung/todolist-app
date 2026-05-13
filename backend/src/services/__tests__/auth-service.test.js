'use strict';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

jest.mock('../../repositories/user-repository');
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

const { userRepository } = require('../../repositories/user-repository');
const { hashPassword, comparePassword } = require('../../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt');
const { authService } = require('../auth-service');
const { AppError } = require('../../types/errors');
const { ErrorCode } = require('../../constants/error-codes');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authService.register', () => {
  it('returns user without password on success', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hashPassword.mockResolvedValue('hashedpw');
    userRepository.create.mockResolvedValue({
      userId: 'uuid-1',
      email: 'test@example.com',
      password: 'hashedpw',
      name: 'Test User',
      provider: 'local',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await authService.register('test@example.com', 'password123', 'Test User');

    expect(result).not.toHaveProperty('password');
    expect(result.email).toBe('test@example.com');
    expect(result.userId).toBe('uuid-1');
  });

  it('throws AppError 409 DUPLICATE_EMAIL when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      userId: 'existing-id',
      email: 'dup@example.com',
    });

    await expect(authService.register('dup@example.com', 'pw', 'Name'))
      .rejects.toMatchObject({
        code: ErrorCode.DUPLICATE_EMAIL,
        statusCode: 409,
      });
  });
});

describe('authService.login', () => {
  it('returns accessToken, refreshToken, userId, expiresIn on success', async () => {
    userRepository.findByEmail.mockResolvedValue({
      userId: 'user-id-1',
      email: 'user@example.com',
      password: 'hashedpw',
    });
    comparePassword.mockResolvedValue(true);
    generateAccessToken.mockReturnValue('access-token-value');
    generateRefreshToken.mockReturnValue('refresh-token-value');

    const result = await authService.login('user@example.com', 'password');

    expect(result).toEqual({
      accessToken: 'access-token-value',
      refreshToken: 'refresh-token-value',
      userId: 'user-id-1',
      expiresIn: 3600,
    });
  });

  it('throws AppError 401 UNAUTHORIZED when email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(authService.login('nouser@example.com', 'pw'))
      .rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
        statusCode: 401,
      });
  });

  it('throws AppError 401 UNAUTHORIZED when password is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue({
      userId: 'user-id-1',
      email: 'user@example.com',
      password: 'hashedpw',
    });
    comparePassword.mockResolvedValue(false);

    await expect(authService.login('user@example.com', 'wrongpassword'))
      .rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
        statusCode: 401,
      });
  });
});

describe('authService.refreshTokens', () => {
  it('returns new accessToken, refreshToken, and expiresIn for a valid refresh token', async () => {
    verifyRefreshToken.mockReturnValue({ userId: 'user-id-1' });
    userRepository.findById.mockResolvedValue({ userId: 'user-id-1', email: 'u@e.com' });
    generateAccessToken.mockReturnValue('new-access-token');
    generateRefreshToken.mockReturnValue('new-refresh-token');

    const result = await authService.refreshTokens('valid-refresh-token');

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600,
    });
    expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
  });

  it('throws AppError 401 INVALID_TOKEN when refresh token is invalid', async () => {
    verifyRefreshToken.mockImplementation(() => { throw new Error('jwt malformed'); });

    await expect(authService.refreshTokens('bad-token'))
      .rejects.toMatchObject({
        code: ErrorCode.INVALID_TOKEN,
        statusCode: 401,
      });
  });

  it('throws AppError 404 NOT_FOUND when user no longer exists', async () => {
    verifyRefreshToken.mockReturnValue({ userId: 'ghost-user' });
    userRepository.findById.mockResolvedValue(null);

    await expect(authService.refreshTokens('valid-token'))
      .rejects.toMatchObject({
        statusCode: 404,
      });
  });
});
