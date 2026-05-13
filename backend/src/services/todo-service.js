const { todoRepository } = require('../repositories/todo-repository');
const { categoryRepository } = require('../repositories/category-repository');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

// BR-12: dueDate < today AND isCompleted=false → overdue (계산 속성, DB 저장 안 함)
function isOverdue(todo) {
  if (!todo.dueDate || todo.isCompleted) return false;
  const due = new Date(todo.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

const todoService = {
  async getTodos(userId, filters) {
    // BR-13: 카테고리/날짜/완료여부 필터
    const todos = await todoRepository.findAllByUserId(userId, filters);
    return todos.map((todo) => ({ ...todo, overdue: isOverdue(todo) }));
  },

  async createTodo(userId, data) {
    // BR-09: title, categoryId 필수
    if (!data.title || data.title.trim().length === 0) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '할일 제목을 입력해주세요.');
    }
    if (data.title.length > 255) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '할일 제목은 255자 이하여야 합니다.');
    }
    if (!data.categoryId) {
      throw new AppError(ErrorCode.INVALID_INPUT, 400, '카테고리를 선택해주세요.');
    }
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '카테고리를 찾을 수 없습니다.');
    }
    if (!category.isDefault && category.userId !== userId) {
      throw new AppError(ErrorCode.FORBIDDEN, 403, '해당 카테고리를 사용할 권한이 없습니다.');
    }
    const todo = await todoRepository.create(userId, { ...data, title: data.title.trim() });
    return { ...todo, overdue: isOverdue(todo) };
  },

  async updateTodo(userId, todoId, data) {
    // BR-10: 소유 검증
    const todo = await todoRepository.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '할일을 찾을 수 없습니다.');
    }
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, '카테고리를 찾을 수 없습니다.');
      }
      if (!category.isDefault && category.userId !== userId) {
        throw new AppError(ErrorCode.FORBIDDEN, 403, '해당 카테고리를 사용할 권한이 없습니다.');
      }
    }
    const updated = await todoRepository.update(todoId, data);
    return { ...updated, overdue: isOverdue(updated) };
  },

  async deleteTodo(userId, todoId) {
    // BR-10: 소유 검증
    const todo = await todoRepository.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '할일을 찾을 수 없습니다.');
    }
    await todoRepository.delete(todoId);
  },

  async toggleCompletion(userId, todoId) {
    // BR-11: isCompleted 토글, completedAt 자동 처리
    const todo = await todoRepository.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '할일을 찾을 수 없습니다.');
    }
    const updated = await todoRepository.updateCompletion(todoId, !todo.isCompleted);
    return { ...updated, overdue: isOverdue(updated) };
  },
};

module.exports = { todoService };
