import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, getToday, isOverdue, formatDateRange } from '../date-utils';

describe('formatDate', () => {
  it('날짜 문자열에서 YYYY-MM-DD만 반환한다', () => {
    expect(formatDate('2026-05-14T12:00:00.000Z')).toBe('2026-05-14');
  });
  it('이미 YYYY-MM-DD 형식이면 그대로 반환한다', () => {
    expect(formatDate('2026-05-14')).toBe('2026-05-14');
  });
  it('null이면 빈 문자열을 반환한다', () => {
    expect(formatDate(null)).toBe('');
  });
  it('undefined이면 빈 문자열을 반환한다', () => {
    expect(formatDate(undefined)).toBe('');
  });
});

describe('getToday', () => {
  it('오늘 날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-15'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('dueDate가 오늘보다 이전이고 미완료이면 true를 반환한다', () => {
    expect(isOverdue('2026-05-14', false)).toBe(true);
  });
  it('dueDate가 오늘이면 false를 반환한다', () => {
    expect(isOverdue('2026-05-15', false)).toBe(false);
  });
  it('dueDate가 오늘보다 이후이면 false를 반환한다', () => {
    expect(isOverdue('2026-05-16', false)).toBe(false);
  });
  it('dueDate가 지났더라도 완료 상태이면 false를 반환한다', () => {
    expect(isOverdue('2026-05-14', true)).toBe(false);
  });
  it('dueDate가 null이면 false를 반환한다', () => {
    expect(isOverdue(null, false)).toBe(false);
  });
  it('dueDate가 undefined이면 false를 반환한다', () => {
    expect(isOverdue(undefined, false)).toBe(false);
  });
});

describe('formatDateRange', () => {
  it('시작일과 종료일 모두 있으면 "시작일 ~ 종료일" 형식으로 반환한다', () => {
    expect(formatDateRange('2026-05-01', '2026-05-31')).toBe('2026-05-01 ~ 2026-05-31');
  });
  it('종료일만 없으면 "시작일 ~" 형식으로 반환한다', () => {
    expect(formatDateRange('2026-05-01', '')).toBe('2026-05-01 ~');
  });
  it('시작일만 없으면 "~ 종료일" 형식으로 반환한다', () => {
    expect(formatDateRange('', '2026-05-31')).toBe('~ 2026-05-31');
  });
  it('둘 다 없으면 빈 문자열을 반환한다', () => {
    expect(formatDateRange('', '')).toBe('');
  });
});
