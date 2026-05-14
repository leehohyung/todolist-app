import { EMAIL_REGEX, PASSWORD_MIN_LENGTH, NAME_MAX_LENGTH, TITLE_MAX_LENGTH, CATEGORY_NAME_MAX_LENGTH } from '../constants/validation';
import { VALIDATION } from '../constants/messages';

export function validateEmail(email: string): string {
  if (!email.trim()) return VALIDATION.REQUIRED('이메일');
  if (!EMAIL_REGEX.test(email)) return VALIDATION.EMAIL_INVALID;
  return '';
}

export function validatePassword(password: string): string {
  if (!password) return VALIDATION.REQUIRED('비밀번호');
  if (password.length < PASSWORD_MIN_LENGTH) return VALIDATION.PASSWORD_MIN;
  return '';
}

export function validatePasswordMatch(password: string, confirm: string): string {
  if (!confirm) return VALIDATION.REQUIRED('비밀번호 확인');
  if (password !== confirm) return VALIDATION.PASSWORD_MISMATCH;
  return '';
}

export function validateTodoTitle(title: string): string {
  if (!title.trim()) return VALIDATION.REQUIRED('제목');
  if (title.length > TITLE_MAX_LENGTH) return VALIDATION.TITLE_MAX;
  return '';
}

export function validateCategoryName(name: string): string {
  if (!name.trim()) return VALIDATION.REQUIRED('카테고리 이름');
  if (name.length > CATEGORY_NAME_MAX_LENGTH) return VALIDATION.CATEGORY_NAME_MAX;
  return '';
}

export function validateName(name: string): string {
  if (!name.trim()) return VALIDATION.REQUIRED('이름');
  if (name.length > NAME_MAX_LENGTH) return VALIDATION.NAME_MAX;
  return '';
}
