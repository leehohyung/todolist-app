'use strict';

process.env.DB_NAME = 'todolist_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const request = require('supertest');

jest.resetModules();

const { app } = require('../app');
const { cleanDatabase, endPool, getPool } = require('./helpers/db-helper');

let accessToken;
let userId;
let defaultCategoryId;

async function getDefaultCategoryId() {
  const pool = getPool();
  const { rows } = await pool.query(
    "SELECT category_id FROM categories WHERE is_default = true AND name = '개인' LIMIT 1"
  );
  return rows[0] ? rows[0].category_id : null;
}

beforeEach(async () => {
  await cleanDatabase();

  // Register and login a test user
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ email: 'todotest@example.com', password: 'Password123!', name: 'Todo Tester' });

  userId = regRes.body.user.userId;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'todotest@example.com', password: 'Password123!' });

  accessToken = loginRes.body.accessToken;
  defaultCategoryId = await getDefaultCategoryId();
});

afterAll(async () => {
  await endPool();
});

describe('GET /api/todos', () => {
  it('returns empty array initially', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.todos).toEqual([]);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/todos', () => {
  it('creates a todo and returns 201', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'My First Todo', categoryId: defaultCategoryId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('todo');
    expect(res.body.todo.title).toBe('My First Todo');
    expect(res.body.todo).toHaveProperty('todoId');
    expect(res.body.todo).toHaveProperty('overdue');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ categoryId: defaultCategoryId });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 when categoryId is missing', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Todo without category' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });
});

describe('GET /api/todos with filters', () => {
  beforeEach(async () => {
    // Create some todos
    await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Incomplete Todo', categoryId: defaultCategoryId });

    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Todo to complete', categoryId: defaultCategoryId });

    const todoId = createRes.body.todo.todoId;

    await request(app)
      .patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);
  });

  it('GET /api/todos?isCompleted=false returns only incomplete todos', async () => {
    const res = await request(app)
      .get('/api/todos?isCompleted=false')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.todos.every((t) => t.isCompleted === false)).toBe(true);
  });

  it('GET /api/todos?isCompleted=true returns only completed todos', async () => {
    const res = await request(app)
      .get('/api/todos?isCompleted=true')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.todos.every((t) => t.isCompleted === true)).toBe(true);
  });
});

describe('PATCH /api/todos/:id', () => {
  let todoId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Todo to Update', categoryId: defaultCategoryId });
    todoId = res.body.todo.todoId;
  });

  it('updates todo title and returns updated todo', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.todo.title).toBe('Updated Title');
  });
});

describe('PATCH /api/todos/:id/complete', () => {
  let todoId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Toggle Me', categoryId: defaultCategoryId });
    todoId = res.body.todo.todoId;
  });

  it('toggles isCompleted from false to true', async () => {
    const res = await request(app)
      .patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.todo.isCompleted).toBe(true);
  });

  it('toggles isCompleted from true back to false', async () => {
    // First toggle: false -> true
    await request(app)
      .patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Second toggle: true -> false
    const res = await request(app)
      .patch(`/api/todos/${todoId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.todo.isCompleted).toBe(false);
  });
});

describe('DELETE /api/todos/:id', () => {
  let todoId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Todo to Delete', categoryId: defaultCategoryId });
    todoId = res.body.todo.todoId;
  });

  it('returns 204 on successful deletion', async () => {
    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion when trying to delete again', async () => {
    await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app)
      .delete(`/api/todos/${todoId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });
});

describe('Access control: other user todos', () => {
  it('returns 404 when accessing another user\'s todo', async () => {
    // Create a second user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'other@example.com', password: 'Password123!', name: 'Other User' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'other@example.com', password: 'Password123!' });

    const otherToken = loginRes.body.accessToken;

    // Other user creates a todo
    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Other User Todo', categoryId: defaultCategoryId });

    const otherTodoId = createRes.body.todo.todoId;

    // Our test user tries to delete other's todo
    const res = await request(app)
      .delete(`/api/todos/${otherTodoId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });
});
