const { todoRepository } = require('../repositories/todo-repository');
const { categoryRepository } = require('../repositories/category-repository');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

function pad(n) { return String(n).padStart(2, '0'); }
function localDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.isCompleted) return false;
  const dueDate = new Date(todo.dueDate);
  const hours = dueDate.getHours();
  const mins = dueDate.getMinutes();
  if (hours === 0 && mins === 0) {
    return localDateStr(dueDate) < localDateStr(new Date());
  }
  return dueDate < new Date();
}

const todoService = {
  async getTodos(userId, filters) {
    console.log(`[TODO] 목록 조회 - userId: ${userId}, filters: ${JSON.stringify(filters)}`);
    // BR-13: 카테고리/날짜/완료여부 필터
    // dueDate 단일 날짜 필터를 startDate/endDate 범위로 변환 (TIMESTAMP 컬럼 DATE 비교용)
    const repoFilters = { ...filters };
    if (filters.dueDate) {
      repoFilters.startDate = filters.dueDate;          // "YYYY-MM-DD"
      repoFilters.endDate = filters.dueDate;
      delete repoFilters.dueDate;
    }
    const todos = await todoRepository.findAllByUserId(userId, repoFilters);
    console.log(`[TODO] 목록 조회 완료 - userId: ${userId}, count: ${todos.length}`);
    return todos.map((todo) => ({ ...todo, overdue: isOverdue(todo) }));
  },

  async createTodo(userId, data) {
    console.log(`[TODO] 생성 시도 - userId: ${userId}, title: ${data.title}`);
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
      console.warn(`[TODO] 카테고리 권한 없음 - userId: ${userId}, categoryId: ${data.categoryId}`);
      throw new AppError(ErrorCode.FORBIDDEN, 403, '해당 카테고리를 사용할 권한이 없습니다.');
    }
    const todo = await todoRepository.create(userId, { ...data, title: data.title.trim() });
    console.log(`[TODO] 생성 성공 - todoId: ${todo.todoId}, userId: ${userId}`);
    return { ...todo, overdue: isOverdue(todo) };
  },

  async updateTodo(userId, todoId, data) {
    console.log(`[TODO] 수정 시도 - todoId: ${todoId}, userId: ${userId}`);
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
        console.warn(`[TODO] 수정 카테고리 권한 없음 - userId: ${userId}, categoryId: ${data.categoryId}`);
        throw new AppError(ErrorCode.FORBIDDEN, 403, '해당 카테고리를 사용할 권한이 없습니다.');
      }
    }
    const updated = await todoRepository.update(todoId, data);
    console.log(`[TODO] 수정 성공 - todoId: ${todoId}`);
    return { ...updated, overdue: isOverdue(updated) };
  },

  async deleteTodo(userId, todoId) {
    console.log(`[TODO] 삭제 시도 - todoId: ${todoId}, userId: ${userId}`);
    // BR-10: 소유 검증
    const todo = await todoRepository.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '할일을 찾을 수 없습니다.');
    }
    await todoRepository.delete(todoId);
    console.log(`[TODO] 삭제 성공 - todoId: ${todoId}`);
  },

  async toggleCompletion(userId, todoId) {
    console.log(`[TODO] 완료 토글 시도 - todoId: ${todoId}, userId: ${userId}`);
    // BR-11: isCompleted 토글, completedAt 자동 처리
    const todo = await todoRepository.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '할일을 찾을 수 없습니다.');
    }
    const updated = await todoRepository.updateCompletion(todoId, !todo.isCompleted);
    console.log(`[TODO] 완료 토글 성공 - todoId: ${todoId}, isCompleted: ${updated.isCompleted}`);
    return { ...updated, overdue: isOverdue(updated) };
  },
};

module.exports = { todoService };
