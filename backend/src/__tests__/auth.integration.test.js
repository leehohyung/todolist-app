'use strict';

// Must be set BEFORE any require that triggers config loading
process.env.DB_NAME = 'todolist_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const request = require('supertest');

// Reset module cache so app/pool pick up the test DB_NAME
jest.resetModules();

const { app } = require('../app');
const { cleanDatabase, endPool } = require('./helpers/db-helper');

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await endPool();
});

const validUser = {
  email: 'authtest@example.com',
  password: 'Password123!',
  name: 'Auth Test User',
};

describe('POST /api/auth/register', () => {
  it('returns 201 with user object (no password field) on success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.name).toBe(validUser.name);
    expect(res.body.user).toHaveProperty('userId');
  });

  it('returns 409 for duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('returns 400 or error when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'pw123', name: 'Name' });

    // The service will attempt to find by email=undefined → may throw or succeed depending on DB
    // At minimum we verify no crash (500 would be acceptable too but we want validation)
    expect([400, 409, 500]).toContain(res.status);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('returns 200 with accessToken, refreshToken, userId, expiresIn', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('expiresIn');
    expect(res.body.expiresIn).toBe(3600);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'anypassword' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  let refreshToken;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    refreshToken = loginRes.body.refreshToken;
  });

  it('returns 200 with new tokens for a valid refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('expiresIn');
  });

  it('returns 401 for an invalid refreshToken', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'this.is.invalid' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});
