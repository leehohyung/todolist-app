'use strict';

// Set required env vars before any module loads
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../jwt');

describe('generateAccessToken', () => {
  it('returns a string', () => {
    const token = generateAccessToken('user-123');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('payload contains userId', () => {
    const token = generateAccessToken('user-abc');
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe('user-abc');
  });

  it('expires in approximately 1 hour', () => {
    const token = generateAccessToken('user-123');
    const decoded = jwt.decode(token);
    const expectedExp = Math.floor(Date.now() / 1000) + 3600;
    // Allow 5 seconds tolerance
    expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 5);
    expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
  });
});

describe('generateRefreshToken', () => {
  it('returns a string', () => {
    const token = generateRefreshToken('user-123');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('payload contains userId', () => {
    const token = generateRefreshToken('user-abc');
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe('user-abc');
  });

  it('expires in approximately 7 days', () => {
    const token = generateRefreshToken('user-123');
    const decoded = jwt.decode(token);
    const expectedExp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    // Allow 5 seconds tolerance
    expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 5);
    expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 5);
  });
});

describe('verifyAccessToken', () => {
  it('returns decoded payload for a valid access token', () => {
    const token = generateAccessToken('user-verify');
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('user-verify');
  });

  it('throws for an invalid/tampered access token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('throws for a refresh token passed as access token', () => {
    const refreshToken = generateRefreshToken('user-123');
    expect(() => verifyAccessToken(refreshToken)).toThrow();
  });
});

describe('verifyRefreshToken', () => {
  it('returns decoded payload for a valid refresh token', () => {
    const token = generateRefreshToken('user-refresh');
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe('user-refresh');
  });

  it('throws for an invalid/tampered refresh token', () => {
    expect(() => verifyRefreshToken('bad.token.value')).toThrow();
  });

  it('throws for an access token passed as refresh token', () => {
    const accessToken = generateAccessToken('user-123');
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});
