'use strict';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

jest.mock('../../repositories/todo-repository');
jest.mock('../../repositories/category-repository');

const { todoRepository } = require('../../repositories/todo-repository');
const { categoryRepository } = require('../../repositories/category-repository');
const { todoService } = require('../todo-service');
const { ErrorCode } = require('../../constants/error-codes');

beforeEach(() => {
  jest.clearAllMocks();
});

function makeTodo(overrides = {}) {
  return {
    todoId: 'todo-1',
    userId: 'user-1',
    categoryId: 'cat-1',
    title: 'Test Todo',
    description: null,
    dueDate: null,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('todoService.getTodos', () => {
  it('returns todos with overdue field computed', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDue = yesterday.toISOString().split('T')[0];

    const todos = [
      makeTodo({ todoId: 'todo-1', dueDate: pastDue, isCompleted: false }),
      makeTodo({ todoId: 'todo-2', dueDate: null, isCompleted: false }),
      makeTodo({ todoId: 'todo-3', dueDate: pastDue, isCompleted: true }),
    ];
    todoRepository.findAllByUserId.mockResolvedValue(todos);

    const result = await todoService.getTodos('user-1', {});

    expect(result[0].overdue).toBe(true);   // past due, not completed
    expect(result[1].overdue).toBe(false);  // no due date
    expect(result[2].overdue).toBe(false);  // completed, so not overdue
  });

  it('returns empty array when no todos exist', async () => {
    todoRepository.findAllByUserId.mockResolvedValue([]);

    const result = await todoService.getTodos('user-1', {});
    expect(result).toEqual([]);
  });
});

describe('todoService.createTodo', () => {
  it('throws 400 INVALID_INPUT when title is missing', async () => {
    await expect(todoService.createTodo('user-1', { title: '', categoryId: 'cat-1' }))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 400 INVALID_INPUT when title is whitespace only', async () => {
    await expect(todoService.createTodo('user-1', { title: '   ', categoryId: 'cat-1' }))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 400 INVALID_INPUT when title exceeds 255 characters', async () => {
    const longTitle = 'a'.repeat(256);
    await expect(todoService.createTodo('user-1', { title: longTitle, categoryId: 'cat-1' }))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 400 INVALID_INPUT when categoryId is missing', async () => {
    await expect(todoService.createTodo('user-1', { title: 'Valid Title' }))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 404 NOT_FOUND when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(todoService.createTodo('user-1', { title: 'Todo', categoryId: 'nonexistent' }))
      .rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('throws 403 FORBIDDEN when category belongs to a different user', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-1',
      isDefault: false,
      userId: 'other-user',
    });

    await expect(todoService.createTodo('user-1', { title: 'Todo', categoryId: 'cat-1' }))
      .rejects.toMatchObject({ code: ErrorCode.FORBIDDEN, statusCode: 403 });
  });

  it('creates todo and returns it with overdue field on success', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-1',
      isDefault: true,
      userId: null,
    });
    const createdTodo = makeTodo({ title: 'New Todo' });
    todoRepository.create.mockResolvedValue(createdTodo);

    const result = await todoService.createTodo('user-1', { title: 'New Todo', categoryId: 'cat-1' });

    expect(result).toHaveProperty('overdue');
    expect(result.title).toBe('New Todo');
    expect(todoRepository.create).toHaveBeenCalledWith('user-1', expect.objectContaining({ title: 'New Todo' }));
  });

  it('allows using a category that belongs to the same user (non-default)', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-1',
      isDefault: false,
      userId: 'user-1',
    });
    const createdTodo = makeTodo({ title: 'My Todo' });
    todoRepository.create.mockResolvedValue(createdTodo);

    const result = await todoService.createTodo('user-1', { title: 'My Todo', categoryId: 'cat-1' });
    expect(result.todoId).toBe('todo-1');
  });
});

describe('todoService.updateTodo', () => {
  it('throws 404 NOT_FOUND when todo does not exist or does not belong to user', async () => {
    todoRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(todoService.updateTodo('user-1', 'todo-999', { title: 'Updated' }))
      .rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('updates and returns todo with overdue field on success', async () => {
    const existing = makeTodo();
    todoRepository.findByIdAndUserId.mockResolvedValue(existing);
    const updated = makeTodo({ title: 'Updated Title' });
    todoRepository.update.mockResolvedValue(updated);

    const result = await todoService.updateTodo('user-1', 'todo-1', { title: 'Updated Title' });

    expect(result).toHaveProperty('overdue');
    expect(result.title).toBe('Updated Title');
  });
});

describe('todoService.deleteTodo', () => {
  it('throws 404 NOT_FOUND when todo does not exist', async () => {
    todoRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(todoService.deleteTodo('user-1', 'todo-999'))
      .rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('deletes todo successfully', async () => {
    todoRepository.findByIdAndUserId.mockResolvedValue(makeTodo());
    todoRepository.delete.mockResolvedValue();

    await expect(todoService.deleteTodo('user-1', 'todo-1')).resolves.toBeUndefined();
    expect(todoRepository.delete).toHaveBeenCalledWith('todo-1');
  });
});

describe('todoService.toggleCompletion', () => {
  it('throws 404 NOT_FOUND when todo does not exist', async () => {
    todoRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(todoService.toggleCompletion('user-1', 'todo-999'))
      .rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('toggles isCompleted from false to true and returns updated todo', async () => {
    const existing = makeTodo({ isCompleted: false });
    todoRepository.findByIdAndUserId.mockResolvedValue(existing);
    const updated = makeTodo({ isCompleted: true, completedAt: new Date() });
    todoRepository.updateCompletion.mockResolvedValue(updated);

    const result = await todoService.toggleCompletion('user-1', 'todo-1');

    expect(todoRepository.updateCompletion).toHaveBeenCalledWith('todo-1', true);
    expect(result.isCompleted).toBe(true);
    expect(result).toHaveProperty('overdue');
  });

  it('toggles isCompleted from true to false', async () => {
    const existing = makeTodo({ isCompleted: true });
    todoRepository.findByIdAndUserId.mockResolvedValue(existing);
    const updated = makeTodo({ isCompleted: false, completedAt: null });
    todoRepository.updateCompletion.mockResolvedValue(updated);

    const result = await todoService.toggleCompletion('user-1', 'todo-1');

    expect(todoRepository.updateCompletion).toHaveBeenCalledWith('todo-1', false);
    expect(result.isCompleted).toBe(false);
  });
});
