'use strict';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

// Mock the jwt utility so we control verifyAccessToken behavior
jest.mock('../../utils/jwt', () => ({
  verifyAccessToken: jest.fn(),
}));

const { verifyAccessToken } = require('../../utils/jwt');
const { authMiddleware } = require('../auth-middleware');
const { AppError } = require('../../types/errors');
const { ErrorCode } = require('../../constants/error-codes');

function makeReqResNext(authHeader) {
  const req = { headers: {} };
  if (authHeader !== undefined) {
    req.headers.authorization = authHeader;
  }
  const res = {};
  const next = jest.fn();
  return { req, res, next };
}

describe('authMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls next with UNAUTHORIZED AppError when Authorization header is missing', () => {
    const { req, res, next } = makeReqResNext();
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(err.statusCode).toBe(401);
  });

  it('calls next with UNAUTHORIZED AppError when Authorization scheme is not Bearer', () => {
    const { req, res, next } = makeReqResNext('Basic sometoken');
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(err.statusCode).toBe(401);
  });

  it('calls next with INVALID_TOKEN AppError when verifyAccessToken throws', () => {
    verifyAccessToken.mockImplementation(() => { throw new Error('invalid'); });

    const { req, res, next } = makeReqResNext('Bearer badtoken');
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe(ErrorCode.INVALID_TOKEN);
    expect(err.statusCode).toBe(401);
  });

  it('sets req.userId and calls next() with no argument for a valid token', () => {
    verifyAccessToken.mockReturnValue({ userId: 'user-id-123' });

    const { req, res, next } = makeReqResNext('Bearer validtoken');
    authMiddleware(req, res, next);

    expect(req.userId).toBe('user-id-123');
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // no error argument
  });

  it('extracts token correctly (strips "Bearer " prefix)', () => {
    verifyAccessToken.mockReturnValue({ userId: 'user-abc' });

    const { req, res, next } = makeReqResNext('Bearer myActualToken');
    authMiddleware(req, res, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('myActualToken');
  });
});
