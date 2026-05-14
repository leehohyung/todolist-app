'use strict';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

const { errorHandler } = require('../error-handler');
const { AppError } = require('../../types/errors');
const { ErrorCode } = require('../../constants/error-codes');

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

describe('errorHandler', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('returns correct statusCode, code, and message for AppError', () => {
    const err = new AppError(ErrorCode.NOT_FOUND, 404, 'Resource not found');
    const req = {};
    const res = makeRes();
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res._status).toBe(404);
    expect(res._body).toEqual({
      error: { code: ErrorCode.NOT_FOUND, message: 'Resource not found' },
    });
  });

  it('returns 409 and DUPLICATE_EMAIL for duplicate email AppError', () => {
    const err = new AppError(ErrorCode.DUPLICATE_EMAIL, 409, '이미 사용 중인 이메일입니다.');
    const res = makeRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res._status).toBe(409);
    expect(res._body.error.code).toBe(ErrorCode.DUPLICATE_EMAIL);
  });

  it('returns 500 with INTERNAL_SERVER_ERROR for generic Error', () => {
    const err = new Error('Something went wrong');
    const res = makeRes();

    errorHandler(err, {}, res, jest.fn());

    expect(res._status).toBe(500);
    expect(res._body).toEqual({
      error: { code: ErrorCode.INTERNAL_SERVER_ERROR, message: '서버 오류가 발생했습니다.' },
    });
  });

  it('does not include stack trace in the response for AppError', () => {
    const err = new AppError(ErrorCode.UNAUTHORIZED, 401, 'Unauthorized');
    const res = makeRes();

    errorHandler(err, {}, res, jest.fn());

    const bodyStr = JSON.stringify(res._body);
    expect(bodyStr).not.toContain('stack');
    expect(bodyStr).not.toContain('AppError');
  });

  it('does not include stack trace in the response for generic Error', () => {
    const err = new Error('generic error');
    const res = makeRes();

    errorHandler(err, {}, res, jest.fn());

    const bodyStr = JSON.stringify(res._body);
    expect(bodyStr).not.toContain('stack');
  });

  it('logs generic errors to console.error with method and path', () => {
    const err = new Error('some server error');
    const req = { method: 'GET', path: '/api/test' };
    errorHandler(err, req, makeRes(), jest.fn());

    expect(consoleSpy).toHaveBeenCalledWith(
      `[ERROR] 500 INTERNAL - GET /api/test -`,
      err.message
    );
  });

  it('logs AppErrors to console.warn (not console.error)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const err = new AppError(ErrorCode.INVALID_INPUT, 400, 'bad input');
    const req = { method: 'POST', path: '/api/test' };
    errorHandler(err, req, makeRes(), jest.fn());

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      `[ERROR] 400 INVALID_INPUT - POST /api/test - bad input`
    );
    warnSpy.mockRestore();
  });
});
