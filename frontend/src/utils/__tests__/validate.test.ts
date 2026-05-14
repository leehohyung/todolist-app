import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validatePasswordMatch, validateTodoTitle, validateCategoryName, validateName } from '../validate';

describe('validateEmail', () => {
  it('유효한 이메일이면 빈 문자열을 반환한다', () => {
    expect(validateEmail('user@example.com')).toBe('');
  });
  it('이메일이 비어있으면 필수 에러를 반환한다', () => {
    expect(validateEmail('')).toContain('필수');
  });
  it('이메일 형식이 잘못되면 형식 에러를 반환한다', () => {
    expect(validateEmail('notanemail')).toContain('형식');
    expect(validateEmail('missing@')).toContain('형식');
  });
});

describe('validatePassword', () => {
  it('8자 이상 비밀번호는 통과한다', () => {
    expect(validatePassword('password123')).toBe('');
  });
  it('비어있으면 필수 에러를 반환한다', () => {
    expect(validatePassword('')).toContain('필수');
  });
  it('7자 이하이면 길이 에러를 반환한다', () => {
    expect(validatePassword('short')).toContain('8자');
  });
});

describe('validatePasswordMatch', () => {
  it('비밀번호가 일치하면 빈 문자열을 반환한다', () => {
    expect(validatePasswordMatch('password123', 'password123')).toBe('');
  });
  it('확인 비밀번호가 비어있으면 필수 에러를 반환한다', () => {
    expect(validatePasswordMatch('password123', '')).toContain('필수');
  });
  it('비밀번호가 일치하지 않으면 불일치 에러를 반환한다', () => {
    expect(validatePasswordMatch('password123', 'different')).toContain('일치');
  });
});

describe('validateTodoTitle', () => {
  it('유효한 제목이면 빈 문자열을 반환한다', () => {
    expect(validateTodoTitle('할일 제목')).toBe('');
  });
  it('빈 제목이면 필수 에러를 반환한다', () => {
    expect(validateTodoTitle('')).toContain('필수');
    expect(validateTodoTitle('   ')).toContain('필수');
  });
  it('255자 초과이면 길이 에러를 반환한다', () => {
    expect(validateTodoTitle('a'.repeat(256))).toContain('255자');
  });
});

describe('validateCategoryName', () => {
  it('유효한 카테고리명이면 빈 문자열을 반환한다', () => {
    expect(validateCategoryName('업무')).toBe('');
  });
  it('빈 이름이면 필수 에러를 반환한다', () => {
    expect(validateCategoryName('')).toContain('필수');
  });
  it('100자 초과이면 길이 에러를 반환한다', () => {
    expect(validateCategoryName('a'.repeat(101))).toContain('100자');
  });
});

describe('validateName', () => {
  it('유효한 이름이면 빈 문자열을 반환한다', () => {
    expect(validateName('김민준')).toBe('');
  });
  it('빈 이름이면 필수 에러를 반환한다', () => {
    expect(validateName('')).toContain('필수');
  });
  it('100자 초과이면 길이 에러를 반환한다', () => {
    expect(validateName('a'.repeat(101))).toContain('100자');
  });
});
