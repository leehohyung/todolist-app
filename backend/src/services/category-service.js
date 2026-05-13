const { categoryRepository } = require('../repositories/category-repository');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

const categoryService = {
  async getCategoriesForUser(userId) {
    // BR-05: 기본 카테고리 + 사용자 카테고리 통합 반환
    return categoryRepository.findAllForUser(userId);
  },

  async createCategory(userId, name) {
    if (!name || name.trim().length === 0) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '카테고리 이름을 입력해주세요.');
    }
    if (name.length > 100) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '카테고리 이름은 100자 이하여야 합니다.');
    }
    return categoryRepository.create(userId, name.trim());
  },

  async deleteCategory(userId, categoryId) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '카테고리를 찾을 수 없습니다.');
    }
    // BR-05: 기본 카테고리 삭제 금지
    if (category.isDefault) {
      throw new AppError(ErrorCode.FORBIDDEN, 403, '기본 카테고리는 삭제할 수 없습니다.');
    }
    // BR-07: 소유 검증
    if (category.userId !== userId) {
      throw new AppError(ErrorCode.FORBIDDEN, 403, '해당 카테고리를 삭제할 권한이 없습니다.');
    }
    // BR-08: 할일을 기본 '개인' 카테고리로 재분류 후 삭제
    const defaultCategory = await categoryRepository.findDefaultByName('개인');
    if (defaultCategory) {
      await categoryRepository.reclassifyTodos(categoryId, defaultCategory.categoryId);
    }
    await categoryRepository.delete(categoryId);
  },
};

module.exports = { categoryService };
