'use strict';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

jest.mock('../../repositories/category-repository');

const { categoryRepository } = require('../../repositories/category-repository');
const { categoryService } = require('../category-service');
const { AppError } = require('../../types/errors');
const { ErrorCode } = require('../../constants/error-codes');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('categoryService.getCategoriesForUser', () => {
  it('returns array from repository', async () => {
    const mockCategories = [
      { categoryId: '1', name: '개인', isDefault: true },
      { categoryId: '2', name: '업무', isDefault: true },
      { categoryId: '3', name: '쇼핑', isDefault: true },
      { categoryId: '4', name: 'My Cat', isDefault: false, userId: 'user-1' },
    ];
    categoryRepository.findAllForUser.mockResolvedValue(mockCategories);

    const result = await categoryService.getCategoriesForUser('user-1');

    expect(result).toEqual(mockCategories);
    expect(categoryRepository.findAllForUser).toHaveBeenCalledWith('user-1');
  });
});

describe('categoryService.createCategory', () => {
  it('throws 400 INVALID_INPUT for empty name', async () => {
    await expect(categoryService.createCategory('user-1', ''))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 400 INVALID_INPUT for whitespace-only name', async () => {
    await expect(categoryService.createCategory('user-1', '   '))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 400 INVALID_INPUT when name exceeds 100 characters', async () => {
    const longName = 'a'.repeat(101);
    await expect(categoryService.createCategory('user-1', longName))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('accepts exactly 100 characters', async () => {
    const name = 'a'.repeat(100);
    const mockCategory = { categoryId: 'cat-1', userId: 'user-1', name, isDefault: false };
    categoryRepository.create.mockResolvedValue(mockCategory);

    const result = await categoryService.createCategory('user-1', name);
    expect(result).toEqual(mockCategory);
  });

  it('returns created category for valid name', async () => {
    const mockCategory = { categoryId: 'cat-1', userId: 'user-1', name: 'Work', isDefault: false };
    categoryRepository.create.mockResolvedValue(mockCategory);

    const result = await categoryService.createCategory('user-1', 'Work');

    expect(result).toEqual(mockCategory);
    expect(categoryRepository.create).toHaveBeenCalledWith('user-1', 'Work');
  });

  it('trims whitespace from name before creating', async () => {
    const mockCategory = { categoryId: 'cat-1', userId: 'user-1', name: 'Work', isDefault: false };
    categoryRepository.create.mockResolvedValue(mockCategory);

    await categoryService.createCategory('user-1', '  Work  ');

    expect(categoryRepository.create).toHaveBeenCalledWith('user-1', 'Work');
  });
});

describe('categoryService.deleteCategory', () => {
  it('throws 404 NOT_FOUND when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(categoryService.deleteCategory('user-1', 'cat-999'))
      .rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('throws 403 FORBIDDEN when category is a default category', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-default',
      isDefault: true,
      userId: null,
    });

    await expect(categoryService.deleteCategory('user-1', 'cat-default'))
      .rejects.toMatchObject({ code: ErrorCode.FORBIDDEN, statusCode: 403 });
  });

  it('throws 403 FORBIDDEN when category belongs to a different user', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-2',
      isDefault: false,
      userId: 'other-user',
    });

    await expect(categoryService.deleteCategory('user-1', 'cat-2'))
      .rejects.toMatchObject({ code: ErrorCode.FORBIDDEN, statusCode: 403 });
  });

  it('reclassifies todos to "개인" then deletes category on success', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-to-delete',
      isDefault: false,
      userId: 'user-1',
    });
    const defaultCat = { categoryId: 'default-gaeyin', name: '개인', isDefault: true };
    categoryRepository.findDefaultByName.mockResolvedValue(defaultCat);
    categoryRepository.reclassifyTodos.mockResolvedValue();
    categoryRepository.delete.mockResolvedValue();

    await categoryService.deleteCategory('user-1', 'cat-to-delete');

    expect(categoryRepository.findDefaultByName).toHaveBeenCalledWith('개인');
    expect(categoryRepository.reclassifyTodos).toHaveBeenCalledWith('cat-to-delete', 'default-gaeyin');
    expect(categoryRepository.delete).toHaveBeenCalledWith('cat-to-delete');
  });

  it('deletes category even when default "개인" category is not found', async () => {
    categoryRepository.findById.mockResolvedValue({
      categoryId: 'cat-to-delete',
      isDefault: false,
      userId: 'user-1',
    });
    categoryRepository.findDefaultByName.mockResolvedValue(null);
    categoryRepository.delete.mockResolvedValue();

    await categoryService.deleteCategory('user-1', 'cat-to-delete');

    expect(categoryRepository.reclassifyTodos).not.toHaveBeenCalled();
    expect(categoryRepository.delete).toHaveBeenCalledWith('cat-to-delete');
  });
});
