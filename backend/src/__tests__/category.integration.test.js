'use strict';

process.env.DB_NAME = 'todolist_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';
process.env.NODE_ENV = 'test';
process.env.PORT = '3003';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const request = require('supertest');

jest.resetModules();

const { app } = require('../app');
const { cleanDatabase, endPool, getPool } = require('./helpers/db-helper');

let accessToken;

async function getDefaultCategoryId(name = '개인') {
  const pool = getPool();
  const { rows } = await pool.query(
    'SELECT category_id FROM categories WHERE is_default = true AND name = $1 LIMIT 1',
    [name]
  );
  return rows[0] ? rows[0].category_id : null;
}

beforeEach(async () => {
  await cleanDatabase();

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'cattest@example.com', password: 'Password123!', name: 'Cat Tester' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'cattest@example.com', password: 'Password123!' });

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await endPool();
});

describe('GET /api/categories', () => {
  it('returns default categories (3) when user has no custom categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('categories');
    const defaultCats = res.body.categories.filter((c) => c.isDefault);
    expect(defaultCats.length).toBe(3);
  });

  it('returns default + user categories after creation', async () => {
    await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'My Custom Cat' });

    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBe(4); // 3 default + 1 user
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/categories', () => {
  it('creates a category and returns 201', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'New Category' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category.name).toBe('New Category');
    expect(res.body.category.isDefault).toBe(false);
  });

  it('returns 400 for empty name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 for whitespace-only name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 for name exceeding 100 characters', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'a'.repeat(101) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });
});

describe('DELETE /api/categories/:categoryId', () => {
  let customCategoryId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Category to Delete' });
    customCategoryId = res.body.category.categoryId;
  });

  it('deletes a user-created category and returns 204', async () => {
    const res = await request(app)
      .delete(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion when trying to delete again', async () => {
    await request(app)
      .delete(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app)
      .delete(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 403 when trying to delete a default category', async () => {
    const defaultCatId = await getDefaultCategoryId('개인');

    const res = await request(app)
      .delete(`/api/categories/${defaultCatId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns 403 or 404 when trying to delete another user\'s category', async () => {
    // Create second user and their category
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'catother@example.com', password: 'Password123!', name: 'Other Cat User' });

    const otherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'catother@example.com', password: 'Password123!' });

    const otherToken = otherLogin.body.accessToken;

    const otherCatRes = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Other User Category' });

    const otherCatId = otherCatRes.body.category.categoryId;

    // Our test user tries to delete other's category
    const res = await request(app)
      .delete(`/api/categories/${otherCatId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect([403, 404]).toContain(res.status);
  });

  it('reclassifies todos to default category when deleting a category with todos', async () => {
    const pool = getPool();
    const defaultCatId = await getDefaultCategoryId('개인');

    // Create a todo in the custom category
    await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Todo in custom cat', categoryId: customCategoryId });

    // Delete the custom category
    const deleteRes = await request(app)
      .delete(`/api/categories/${customCategoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteRes.status).toBe(204);

    // The todo should now be in the default '개인' category
    const { rows } = await pool.query(
      'SELECT category_id FROM todos WHERE title = $1',
      ['Todo in custom cat']
    );
    expect(rows[0].category_id).toBe(defaultCatId);
  });
});
