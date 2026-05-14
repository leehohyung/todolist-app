const { categoryRepository } = require('../repositories/category-repository');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

const categoryService = {
  async getCategoriesForUser(userId) {
    console.log(`[CATEGORY] 카테고리 목록 조회 - userId: ${userId}`);
    // BR-05: 기본 카테고리 + 사용자 카테고리 통합 반환
    const categories = await categoryRepository.findAllForUser(userId);
    console.log(`[CATEGORY] 카테고리 목록 조회 완료 - userId: ${userId}, count: ${categories.length}`);
    return categories;
  },

  async createCategory(userId, name) {
    console.log(`[CATEGORY] 카테고리 생성 시도 - userId: ${userId}, name: ${name}`);
    if (!name || name.trim().length === 0) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '카테고리 이름을 입력해주세요.');
    }
    if (name.length > 100) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '카테고리 이름은 100자 이하여야 합니다.');
    }
    const category = await categoryRepository.create(userId, name.trim());
    console.log(`[CATEGORY] 카테고리 생성 성공 - categoryId: ${category.categoryId}, name: ${category.name}`);
    return category;
  },

  async deleteCategory(userId, categoryId) {
    console.log(`[CATEGORY] 카테고리 삭제 시도 - userId: ${userId}, categoryId: ${categoryId}`);
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '카테고리를 찾을 수 없습니다.');
    }
    // BR-05: 기본 카테고리 삭제 금지
    if (category.isDefault) {
      console.warn(`[CATEGORY] 기본 카테고리 삭제 시도 차단 - categoryId: ${categoryId}`);
      throw new AppError(ErrorCode.FORBIDDEN, 403, '기본 카테고리는 삭제할 수 없습니다.');
    }
    // BR-07: 소유 검증
    if (category.userId !== userId) {
      console.warn(`[CATEGORY] 권한 없는 삭제 시도 - userId: ${userId}, categoryId: ${categoryId}`);
      throw new AppError(ErrorCode.FORBIDDEN, 403, '해당 카테고리를 삭제할 권한이 없습니다.');
    }
    // BR-08: 할일을 기본 '개인' 카테고리로 재분류 후 삭제
    const defaultCategory = await categoryRepository.findDefaultByName('개인');
    if (defaultCategory) {
      console.log(`[CATEGORY] 할일 재분류 - categoryId: ${categoryId} → '개인'(${defaultCategory.categoryId})`);
      await categoryRepository.reclassifyTodos(categoryId, defaultCategory.categoryId);
    }
    await categoryRepository.delete(categoryId);
    console.log(`[CATEGORY] 카테고리 삭제 완료 - categoryId: ${categoryId}`);
  },
};

module.exports = { categoryService };
