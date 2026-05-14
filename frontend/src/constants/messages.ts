export const AUTH = {
  LOGIN_SUCCESS: '로그인되었습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  REGISTER_SUCCESS: '회원가입이 완료되었습니다. 로그인해 주세요.',
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  PROFILE_UPDATE_SUCCESS: '정보가 수정되었습니다.',
  WRONG_CURRENT_PASSWORD: '현재 비밀번호가 올바르지 않습니다.',
} as const;

export const TODO = {
  CREATE_SUCCESS: '할일이 추가되었습니다.',
  UPDATE_SUCCESS: '할일이 수정되었습니다.',
  DELETE_SUCCESS: '할일이 삭제되었습니다.',
  COMPLETE_SUCCESS: '완료 처리되었습니다.',
  INCOMPLETE_SUCCESS: '완료가 취소되었습니다.',
  DELETE_CONFIRM: '이 할일을 삭제하시겠습니까?',
  EMPTY: '등록된 할일이 없습니다.',
  FILTER_EMPTY: '조건에 맞는 할일이 없습니다.',
} as const;

export const CATEGORY = {
  CREATE_SUCCESS: '카테고리가 추가되었습니다.',
  DELETE_SUCCESS: '카테고리가 삭제되었습니다.',
  DELETE_CONFIRM: (name: string) =>
    `'${name}' 카테고리의 할일이 '개인' 카테고리로 이동됩니다. 삭제하시겠습니까?`,
} as const;

export const VALIDATION = {
  REQUIRED: (field: string) => `${field}은(는) 필수 입력 항목입니다.`,
  EMAIL_INVALID: '이메일 형식이 올바르지 않습니다.',
  EMAIL_DUPLICATE: '이미 사용 중인 이메일입니다.',
  PASSWORD_MIN: '비밀번호는 8자 이상이어야 합니다.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  NAME_MAX: '이름은 100자 이하여야 합니다.',
  TITLE_MAX: '제목은 255자 이하여야 합니다.',
  CATEGORY_NAME_MAX: '카테고리 이름은 100자 이하여야 합니다.',
  DATE_RANGE: '시작일은 종료일보다 빠른 날짜여야 합니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
} as const;
