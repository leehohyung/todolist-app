# TodoListApp Tailwind CSS 스타일 가이드

**버전:** 1.0.0
**작성일:** 2026-05-14
**상태:** 초안
**참조 문서:**
- `docs/9-front-integration.md` — 프론트엔드 통합 가이드
- `docs/8-wireframe.md` — 와이어프레임
- `docs/4-project-structure-principles.md` — 프로젝트 구조 원칙

> **디자인 레퍼런스:** 첨부 이미지(TimeBlocks 앱)의 파스텔 컬러 카테고리 태그, 카드형 할일 목록,
> 카테고리 관리 화면의 컬러 체크박스 스타일을 참조하여 구성합니다.

---

## 목차

1. [Tailwind 설정 (tailwind.config.ts)](#1-tailwind-설정)
2. [글로벌 스타일 (index.css)](#2-글로벌-스타일)
3. [컬러 시스템](#3-컬러-시스템)
4. [타이포그래피](#4-타이포그래피)
5. [간격 / 크기 규칙](#5-간격--크기-규칙)
6. [공통 컴포넌트 클래스 패턴](#6-공통-컴포넌트-클래스-패턴)
7. [할일(Todo) 컴포넌트 스타일](#7-할일todo-컴포넌트-스타일)
8. [카테고리 컴포넌트 스타일](#8-카테고리-컴포넌트-스타일)
9. [필터 바 스타일](#9-필터-바-스타일)
10. [모달 / 다이얼로그 스타일](#10-모달--다이얼로그-스타일)
11. [폼 및 입력 필드 스타일](#11-폼-및-입력-필드-스타일)
12. [토스트 / 피드백 메시지](#12-토스트--피드백-메시지)
13. [반응형 패턴](#13-반응형-패턴)
14. [상태별 스타일 (완료·기한초과·로딩·빈상태)](#14-상태별-스타일)
15. [접근성 유틸리티](#15-접근성-유틸리티)

---

## 1. Tailwind 설정

### 1.1 패키지 설치

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### 1.2 vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
});
```

### 1.3 tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',  // 2차 다크 모드 대비 — class 방식
  theme: {
    extend: {
      // ── 브레이크포인트 (docs/8-wireframe.md 기준) ──
      screens: {
        sm: '375px',   // 모바일 기준점
        md: '768px',   // 태블릿
        lg: '1024px',  // 데스크톱
        xl: '1280px',  // 넓은 데스크톱
      },

      // ── 색상 (TimeBlocks 파스텔 팔레트 참고) ──
      colors: {
        // 기본 배경 / 텍스트
        bg: {
          primary:   '#ffffff',
          secondary: '#f8f9fa',
          card:      '#ffffff',
        },
        text: {
          primary:   '#1a1a2e',
          secondary: '#6b7280',
          muted:     '#9ca3af',
        },
        border: {
          DEFAULT: '#e5e7eb',
          focus:   '#3b82f6',
        },

        // 액션 컬러
        accent:  '#3b82f6',  // 기본 버튼
        success: '#22c55e',  // 완료 / 회원가입
        danger:  '#ef4444',  // 삭제 / 기한 초과
        warning: '#f59e0b',  // 경고

        // 카테고리 파스텔 컬러 (TimeBlocks 참고)
        cat: {
          blue:   '#93c5fd',   // 업무
          green:  '#86efac',   // 개인
          yellow: '#fde68a',   // 쇼핑
          purple: '#c4b5fd',   // 사용자 정의 1
          pink:   '#f9a8d4',   // 사용자 정의 2
          orange: '#fdba74',   // 사용자 정의 3
          teal:   '#5eead4',   // 사용자 정의 4
        },
      },

      // ── 폰트 ──
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'sans-serif'],
      },
      fontSize: {
        xs:  ['12px', { lineHeight: '1.4' }],
        sm:  ['14px', { lineHeight: '1.5' }],
        md:  ['16px', { lineHeight: '1.6' }],
        lg:  ['18px', { lineHeight: '1.6' }],
        xl:  ['22px', { lineHeight: '1.4' }],
        '2xl': ['28px', { lineHeight: '1.3' }],
      },

      // ── 그림자 ──
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.08)',
        md:   '0 4px 12px rgba(0,0,0,0.10)',
        lg:   '0 8px 24px rgba(0,0,0,0.12)',
        card: '0 2px 8px rgba(0,0,0,0.06)',
      },

      // ── 반경 ──
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        full: '9999px',
      },

      // ── 트랜지션 ──
      transitionDuration: {
        fast:   '150ms',
        normal: '200ms',
        slow:   '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 2. 글로벌 스타일

```css
/* src/index.css */
@import "tailwindcss";

/* ── 기본 리셋 ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  color: #1a1a2e;
  background-color: #f8f9fa;
  -webkit-font-smoothing: antialiased;
}

/* ── 스크롤바 (데스크톱 Webkit) ── */
::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: #f1f5f9; }
::-webkit-scrollbar-thumb  { background: #cbd5e1; border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* ── 포커스 아웃라인 (접근성) ── */
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* ── 인풋 iOS 줌 방지 ── */
input, select, textarea {
  font-size: 16px;
}
```

---

## 3. 컬러 시스템

### 3.1 사용 원칙

| 용도 | Tailwind 클래스 | 색상값 |
|---|---|---|
| 페이지 배경 | `bg-bg-secondary` | `#f8f9fa` |
| 카드 배경 | `bg-bg-card` / `bg-white` | `#ffffff` |
| 주요 텍스트 | `text-text-primary` | `#1a1a2e` |
| 보조 텍스트 | `text-text-secondary` | `#6b7280` |
| 흐린 텍스트 | `text-text-muted` | `#9ca3af` |
| 기본 버튼 | `bg-accent` | `#3b82f6` |
| 성공/완료 | `bg-success` | `#22c55e` |
| 삭제/위험 | `bg-danger` | `#ef4444` |
| 기본 테두리 | `border-border` | `#e5e7eb` |

### 3.2 카테고리 컬러 배지

TimeBlocks 참고 이미지처럼 카테고리마다 파스텔 배경에 진한 텍스트를 사용한다.

| 카테고리 | bg 클래스 | 색상값 |
|---|---|---|
| 업무 | `bg-cat-blue` | `#93c5fd` |
| 개인 | `bg-cat-green` | `#86efac` |
| 쇼핑 | `bg-cat-yellow` | `#fde68a` |
| 사용자 정의 1 | `bg-cat-purple` | `#c4b5fd` |
| 사용자 정의 2 | `bg-cat-pink` | `#f9a8d4` |
| 사용자 정의 3 | `bg-cat-orange` | `#fdba74` |
| 사용자 정의 4 | `bg-cat-teal` | `#5eead4` |

#### 카테고리 컬러 동적 주입 (Tailwind 주의사항)

Tailwind는 동적 클래스명을 purge하므로, 카테고리 컬러는 `style` prop으로 직접 주입한다.

```tsx
// ✅ 올바른 방식 — style prop으로 동적 색상 주입
const CATEGORY_COLORS = [
  '#93c5fd', '#86efac', '#fde68a',
  '#c4b5fd', '#f9a8d4', '#fdba74', '#5eead4',
];

function CategoryBadge({ name, index }: { name: string; index: number }) {
  const bg = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-text-primary"
      style={{ backgroundColor: bg }}
    >
      {name}
    </span>
  );
}

// ❌ 잘못된 방식 — 동적 클래스명은 빌드 시 제거됨
// className={`bg-cat-${color}`}
```

---

## 4. 타이포그래피

### 4.1 텍스트 클래스 사용 기준

| 용도 | 클래스 조합 |
|---|---|
| 페이지 타이틀 | `text-xl font-bold text-text-primary` |
| 섹션 헤더 | `text-lg font-semibold text-text-primary` |
| 카드 제목 | `text-md font-medium text-text-primary` |
| 본문 | `text-sm text-text-primary` |
| 보조 정보 | `text-xs text-text-secondary` |
| 레이블 | `text-sm font-medium text-text-secondary` |
| 에러 메시지 | `text-xs text-danger` |
| 완료 텍스트 (취소선) | `line-through text-text-muted` |

### 4.2 예시

```tsx
// 페이지 타이틀
<h1 className="text-xl font-bold text-text-primary">할일 목록</h1>

// 인사말
<p className="text-md text-text-secondary">안녕하세요, {name}님!</p>

// 완료된 할일 제목
<span className={`text-sm font-medium ${isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
  {title}
</span>

// 마감일 (기한 초과 시 빨간색)
<span className={`text-xs ${overdue ? 'text-danger font-semibold' : 'text-text-secondary'}`}>
  {dueDate}
</span>
```

---

## 5. 간격 / 크기 규칙

### 5.1 간격 체계

| 단계 | Tailwind | px |
|---|---|---|
| xs | `p-1` / `gap-1` | 4px |
| sm | `p-2` / `gap-2` | 8px |
| md | `p-4` / `gap-4` | 16px |
| lg | `p-6` / `gap-6` | 24px |
| xl | `p-8` / `gap-8` | 32px |

### 5.2 컴포넌트 최소 터치 타겟

모바일에서 모든 인터랙티브 요소는 최소 44×44px을 확보한다.

```tsx
// 버튼 최소 크기 보장
<button className="min-h-[44px] min-w-[44px] flex items-center justify-center">
  ...
</button>

// 체크박스 터치 영역 확장
<label className="flex items-center gap-3 cursor-pointer p-2 -m-2">
  <input type="checkbox" className="w-5 h-5 rounded" />
  <span>{title}</span>
</label>
```

---

## 6. 공통 컴포넌트 클래스 패턴

### 6.1 Button

```tsx
// src/components/common/Button.tsx

// 기본 클래스 (모든 버튼 공통)
const base = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] px-4 py-2';

const variants = {
  primary: `${base} bg-accent text-white hover:bg-blue-600 active:scale-[0.98]`,
  success: `${base} bg-success text-white hover:bg-green-600 active:scale-[0.98]`,
  danger:  `${base} bg-danger text-white hover:bg-red-600 active:scale-[0.98]`,
  ghost:   `${base} bg-transparent text-text-secondary border border-border hover:bg-gray-100 active:scale-[0.98]`,
  outline: `${base} bg-white text-accent border border-accent hover:bg-blue-50 active:scale-[0.98]`,
};

// 사용 예시
<button className={variants.primary}>등록</button>
<button className={variants.danger}>삭제</button>
<button className={variants.ghost}>취소</button>
```

### 6.2 Card

```tsx
// 기본 카드 래퍼
const card = 'bg-white rounded-lg shadow-card border border-border p-4';

// 호버 카드 (클릭 가능)
const cardHover = `${card} cursor-pointer hover:shadow-md transition-shadow duration-normal`;

// 사용 예시
<div className={card}>...</div>
```

### 6.3 Badge / Chip

```tsx
// 기본 배지
const badge = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';

// 상태별 배지
const badgeSuccess = `${badge} bg-green-100 text-green-800`;
const badgeDanger  = `${badge} bg-red-100 text-danger`;
const badgeMuted   = `${badge} bg-gray-100 text-text-secondary`;

// 기한 초과 배지
<span className={`${badge} bg-danger text-white`}>기한 초과</span>

// 완료 배지
<span className={`${badge} bg-green-100 text-green-700`}>완료</span>
```

### 6.4 Divider

```tsx
<hr className="border-0 border-t border-border my-4" />
```

---

## 7. 할일(Todo) 컴포넌트 스타일

### 7.1 TodoItem — 카드 (모바일)

TimeBlocks 참고 이미지의 카드형 할일 항목을 구현한다.

```tsx
function TodoItem({ todo, categoryName, categoryIndex, onToggle, onEdit, onDelete }) {
  return (
    <div
      className={`
        flex items-start gap-3 p-4 bg-white rounded-lg shadow-card border
        transition-all duration-normal
        ${todo.isCompleted
          ? 'border-border opacity-70'
          : todo.overdue
            ? 'border-red-200 bg-red-50'
            : 'border-border hover:shadow-md'
        }
      `}
    >
      {/* 체크박스 */}
      <label className="flex-shrink-0 cursor-pointer pt-0.5">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onToggle(todo.todoId)}
          className="w-5 h-5 rounded border-2 border-border text-accent cursor-pointer
                     checked:bg-accent checked:border-accent transition-colors duration-fast"
          aria-label={`${todo.title} 완료 토글`}
        />
      </label>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug break-words
          ${todo.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}
        >
          {todo.title}
        </p>

        {todo.description && (
          <p className="mt-1 text-xs text-text-secondary line-clamp-2">
            {todo.description}
          </p>
        )}

        {/* 메타 정보 행 */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <CategoryBadge name={categoryName} index={categoryIndex} />

          {todo.dueDate && (
            <span className={`text-xs ${todo.overdue ? 'text-danger font-semibold' : 'text-text-secondary'}`}>
              {todo.dueDate}
            </span>
          )}

          {todo.overdue && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-danger text-white">
              기한 초과
            </span>
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <button
          onClick={() => onEdit(todo.todoId)}
          className="p-2 rounded-md text-text-secondary hover:bg-gray-100 hover:text-accent
                     transition-colors duration-fast min-h-[36px] min-w-[36px]"
          aria-label="수정"
        >
          ✎
        </button>
        <button
          onClick={() => onDelete(todo.todoId)}
          className="p-2 rounded-md text-text-secondary hover:bg-red-50 hover:text-danger
                     transition-colors duration-fast min-h-[36px] min-w-[36px]"
          aria-label="삭제"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
```

### 7.2 TodoList — 목록 래퍼

```tsx
function TodoList({ todos, ...handlers }) {
  return (
    <div className="flex flex-col gap-3">
      {todos.map((todo, i) => (
        <TodoItem key={todo.todoId} todo={todo} {...handlers} />
      ))}
    </div>
  );
}
```

### 7.3 데스크톱 테이블 레이아웃

모바일에서는 카드, 데스크톱(`lg:`)에서는 테이블로 전환한다.

```tsx
// 레이아웃 전환 패턴
<div>
  {/* 모바일: 카드 리스트 */}
  <div className="flex flex-col gap-3 lg:hidden">
    {todos.map(todo => <TodoItem key={todo.todoId} todo={todo} {...handlers} />)}
  </div>

  {/* 데스크톱: 테이블 */}
  <div className="hidden lg:block overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border bg-bg-secondary">
          <th className="py-3 px-4 text-left font-semibold text-text-secondary w-10">완료</th>
          <th className="py-3 px-4 text-left font-semibold text-text-secondary">제목</th>
          <th className="py-3 px-4 text-left font-semibold text-text-secondary w-28">카테고리</th>
          <th className="py-3 px-4 text-left font-semibold text-text-secondary w-28">마감일</th>
          <th className="py-3 px-4 text-left font-semibold text-text-secondary w-20">상태</th>
          <th className="py-3 px-4 text-right font-semibold text-text-secondary w-24">작업</th>
        </tr>
      </thead>
      <tbody>
        {todos.map(todo => (
          <tr key={todo.todoId} className="border-b border-border hover:bg-bg-secondary transition-colors duration-fast">
            <td className="py-3 px-4">
              <input type="checkbox" checked={todo.isCompleted}
                onChange={() => handlers.onToggle(todo.todoId)}
                className="w-4 h-4 rounded border-border text-accent cursor-pointer" />
            </td>
            <td className={`py-3 px-4 font-medium ${todo.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
              {todo.title}
            </td>
            <td className="py-3 px-4">
              <CategoryBadge name={todo.categoryName} index={todo.categoryIndex} />
            </td>
            <td className={`py-3 px-4 text-sm ${todo.overdue ? 'text-danger font-semibold' : 'text-text-secondary'}`}>
              {todo.dueDate ?? '—'}
            </td>
            <td className="py-3 px-4">
              {todo.overdue && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-danger text-white">초과</span>
              )}
            </td>
            <td className="py-3 px-4 text-right">
              <button onClick={() => handlers.onEdit(todo.todoId)}
                className="text-xs text-accent hover:underline mr-3">수정</button>
              <button onClick={() => handlers.onDelete(todo.todoId)}
                className="text-xs text-danger hover:underline">삭제</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

## 8. 카테고리 컴포넌트 스타일

TimeBlocks 참고 이미지의 카테고리 관리 화면 — 색상 체크박스 아이콘 + 이름 + 설정 버튼 구성을 참고한다.

### 8.1 CategoryItem

```tsx
function CategoryItem({ category, index, onDelete }) {
  const COLORS = [
    '#93c5fd', '#86efac', '#fde68a',
    '#c4b5fd', '#f9a8d4', '#fdba74', '#5eead4',
  ];
  const DEFAULT_COLORS: Record<string, string> = {
    '업무': '#93c5fd', '개인': '#86efac', '쇼핑': '#fde68a',
  };
  const bg = DEFAULT_COLORS[category.name] ?? COLORS[index % COLORS.length];

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-bg-secondary rounded-lg transition-colors duration-fast group">
      {/* TimeBlocks 스타일 컬러 사각 체크박스 */}
      <span
        className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: bg }}
      >
        ✓
      </span>

      {/* 카테고리명 */}
      <span className="flex-1 text-sm font-medium text-text-primary">
        {category.name}
      </span>

      {/* 기본 카테고리: 잠금 표시 */}
      {category.isDefault ? (
        <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-gray-100">
          기본
        </span>
      ) : (
        /* 사용자 카테고리: 삭제 버튼 */
        <button
          onClick={() => onDelete(category.categoryId)}
          className="opacity-0 group-hover:opacity-100 text-xs text-danger hover:bg-red-50
                     px-2 py-1 rounded transition-all duration-fast"
          aria-label={`${category.name} 삭제`}
        >
          삭제
        </button>
      )}
    </div>
  );
}
```

### 8.2 CategoryList — 기본/사용자 섹션 구분

```tsx
function CategoryList({ categories, onDelete }) {
  const defaults = categories.filter(c => c.isDefault);
  const customs  = categories.filter(c => !c.isDefault);

  return (
    <div className="bg-white rounded-lg shadow-card border border-border overflow-hidden">
      {/* 기본 카테고리 섹션 */}
      <div className="px-4 py-2 bg-bg-secondary border-b border-border">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          기본 카테고리
        </span>
      </div>
      <div className="divide-y divide-border px-2">
        {defaults.map((c, i) => (
          <CategoryItem key={c.categoryId} category={c} index={i} />
        ))}
      </div>

      {/* 나의 카테고리 섹션 */}
      {customs.length > 0 && (
        <>
          <div className="px-4 py-2 bg-bg-secondary border-y border-border">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
              나의 카테고리
            </span>
          </div>
          <div className="divide-y divide-border px-2">
            {customs.map((c, i) => (
              <CategoryItem
                key={c.categoryId}
                category={c}
                index={defaults.length + i}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 9. 필터 바 스타일

### 9.1 모바일 아코디언 / 데스크톱 한 줄

```tsx
function FilterBar({ isOpen, onToggle }) {
  return (
    <div className="bg-white rounded-lg shadow-card border border-border overflow-hidden">
      {/* 헤더 — 모바일에서 토글 버튼 역할 */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3
                   text-sm font-medium text-text-primary hover:bg-bg-secondary
                   transition-colors duration-fast"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <span>🔍</span>
          필터 설정
        </span>
        <span className={`text-text-muted transition-transform duration-normal ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 필터 내용 — 모바일 아코디언 / 데스크톱 항상 표시 */}
      <div className={`
        border-t border-border
        ${isOpen ? 'block' : 'hidden'}
        lg:block
      `}>
        <div className="p-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
          {/* 카테고리 드롭다운 */}
          <div className="flex flex-col gap-1 lg:min-w-[160px]">
            <label className="text-xs font-medium text-text-secondary">카테고리</label>
            <select className="w-full border border-border rounded-md px-3 py-2 text-sm
                               text-text-primary bg-white focus:outline-none focus:ring-2
                               focus:ring-accent focus:border-transparent">
              <option value="">전체</option>
            </select>
          </div>

          {/* 마감일 */}
          <div className="flex flex-col gap-1 lg:min-w-[140px]">
            <label className="text-xs font-medium text-text-secondary">마감일</label>
            <input
              type="date"
              className="w-full border border-border rounded-md px-3 py-2 text-sm
                         text-text-primary bg-white focus:outline-none focus:ring-2
                         focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* 완료 여부 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">완료 여부</label>
            <div className="flex gap-4">
              {['all', 'completed', 'incomplete'].map((v) => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer text-sm text-text-primary">
                  <input type="radio" name="completion" value={v}
                    className="w-4 h-4 text-accent border-border cursor-pointer" />
                  {v === 'all' ? '전체' : v === 'completed' ? '완료됨' : '미완료'}
                </label>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 lg:ml-auto">
            <button className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-white
                               hover:bg-blue-600 transition-colors duration-fast min-h-[40px]">
              적용
            </button>
            <button className="px-4 py-2 rounded-md text-sm font-medium border border-border
                               text-text-secondary hover:bg-bg-secondary transition-colors duration-fast min-h-[40px]">
              초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. 모달 / 다이얼로그 스타일

### 10.1 모달 래퍼

```tsx
function Modal({ title, onClose, children }) {
  return (
    // 오버레이
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
         role="dialog" aria-modal="true" aria-labelledby="modal-title">

      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* 모달 박스 */}
      <div className="relative w-full bg-white rounded-t-xl sm:rounded-xl shadow-lg
                      sm:max-w-lg max-h-[90vh] overflow-y-auto
                      animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-text-muted hover:bg-bg-secondary
                       hover:text-text-primary transition-colors duration-fast"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 내용 */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
```

### 10.2 ConfirmDialog — 삭제 확인

```tsx
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = '삭제' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         role="alertdialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm font-medium border border-border
                       text-text-secondary hover:bg-bg-secondary transition-colors duration-fast"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-sm font-medium bg-danger text-white
                       hover:bg-red-600 transition-colors duration-fast"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 10.3 모달 애니메이션 (tailwind.config.ts에 추가)

```typescript
// tailwind.config.ts > theme.extend
keyframes: {
  'fade-in': {
    from: { opacity: '0' },
    to:   { opacity: '1' },
  },
  'slide-up': {
    from: { transform: 'translateY(16px)', opacity: '0' },
    to:   { transform: 'translateY(0)',    opacity: '1' },
  },
},
animation: {
  'fade-in':  'fade-in 200ms ease-out',
  'slide-up': 'slide-up 250ms ease-out',
},
```

---

## 11. 폼 및 입력 필드 스타일

### 11.1 공통 인풋 클래스

```typescript
// 공통 인풋 베이스
const inputBase = `
  w-full border border-border rounded-md px-3 py-2.5 text-sm text-text-primary
  bg-white placeholder:text-text-muted
  focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
  disabled:bg-bg-secondary disabled:cursor-not-allowed
  transition-shadow duration-fast
`;

// 에러 상태
const inputError = `
  border-danger
  focus:ring-danger
`;
```

### 11.2 폼 필드 컴포넌트 패턴

```tsx
function FormField({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-secondary">
        {label}
        {required && <span className="text-danger ml-0.5" aria-hidden>*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-danger flex items-center gap-1" role="alert">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// 사용 예시
<FormField label="제목" required error={errors.title}>
  <input
    className={`${inputBase} ${errors.title ? inputError : ''}`}
    placeholder="할일 제목을 입력하세요"
  />
</FormField>
```

### 11.3 Select (드롭다운)

```tsx
<select className={`${inputBase} cursor-pointer`}>
  <option value="">카테고리 선택</option>
</select>
```

### 11.4 Textarea

```tsx
<textarea
  rows={3}
  className={`${inputBase} resize-none`}
  placeholder="설명 (선택사항)"
/>
```

---

## 12. 토스트 / 피드백 메시지

### 12.1 Toast 컴포넌트

```tsx
// 위치: 화면 상단 고정, 우측 정렬
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const styles = {
    success: 'bg-white border-l-4 border-success text-text-primary',
    error:   'bg-white border-l-4 border-danger text-text-primary',
    info:    'bg-white border-l-4 border-accent text-text-primary',
  };
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-md
      ${styles[toast.type]} animate-slide-up
    `}>
      <span>{icons[toast.type]}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-muted hover:text-text-primary transition-colors duration-fast"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}
```

---

## 13. 반응형 패턴

### 13.1 Header

```tsx
function Header({ userName, onLogout }) {
  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <a href="/todos" className="text-lg font-bold text-accent flex items-center gap-2">
          📋 TodoListApp
        </a>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden lg:flex items-center gap-6">
          <a href="/todos" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors">할일 목록</a>
          <a href="/categories" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors">카테고리</a>
          <a href="/profile" className="text-sm font-medium text-text-secondary hover:text-accent transition-colors">마이페이지</a>
        </nav>

        {/* 우측 영역 */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-text-secondary">
            👤 {userName}
          </span>
          <button
            onClick={onLogout}
            className="text-sm font-medium text-text-secondary hover:text-danger
                       transition-colors duration-fast"
          >
            로그아웃
          </button>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <button className="lg:hidden p-2 rounded-md hover:bg-bg-secondary transition-colors">
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
```

### 13.2 페이지 레이아웃 래퍼

```tsx
// 전체 페이지 컨테이너
function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

### 13.3 하단 고정 FAB (할일 추가 버튼)

모바일에서는 화면 하단 고정, 데스크톱에서는 콘텐츠 영역 상단에 일반 배치한다.

```tsx
{/* 모바일 FAB */}
<button className="
  fixed bottom-6 right-6 z-30
  w-14 h-14 bg-accent text-white rounded-full shadow-lg
  text-2xl flex items-center justify-center
  hover:bg-blue-600 active:scale-95 transition-all duration-fast
  lg:hidden
" aria-label="할일 추가">
  +
</button>

{/* 데스크톱 일반 버튼 */}
<button className="
  hidden lg:inline-flex items-center gap-2
  px-4 py-2 bg-accent text-white rounded-md text-sm font-medium
  hover:bg-blue-600 transition-colors duration-fast
">
  + 할일 추가
</button>
```

---

## 14. 상태별 스타일

### 14.1 완료 상태

```tsx
// 완료 항목 — 취소선 + 흐림
<div className={todo.isCompleted ? 'opacity-70' : ''}>
  <span className={todo.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}>
    {todo.title}
  </span>
</div>
```

### 14.2 기한 초과 상태

```tsx
// 카드 배경 연한 빨강
<div className={`rounded-lg border p-4 ${
  todo.overdue ? 'bg-red-50 border-red-200' : 'bg-white border-border'
}`}>
```

### 14.3 로딩 상태 — Skeleton

```tsx
function TodoSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg border border-border p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 14.4 빈 상태 (Empty State)

```tsx
function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="text-5xl">📭</span>
      <p className="text-base text-text-secondary font-medium">{message}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 bg-accent text-white rounded-md text-sm font-medium
                     hover:bg-blue-600 transition-colors duration-fast"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// 사용 예시
<EmptyState
  message="등록된 할일이 없습니다."
  actionLabel="+ 할일 추가"
  onAction={() => openTodoForm()}
/>

<EmptyState
  message="조건에 맞는 할일이 없습니다."
  actionLabel="필터 초기화"
  onAction={resetFilter}
/>
```

### 14.5 에러 상태

```tsx
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="text-5xl">⚠️</span>
      <p className="text-base text-danger font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2.5 border border-border text-text-secondary rounded-md
                     text-sm font-medium hover:bg-bg-secondary transition-colors duration-fast"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
```

---

## 15. 접근성 유틸리티

### 15.1 스크린 리더 전용 텍스트

```tsx
// 시각적으로는 숨기되 스크린 리더에는 읽힘
<span className="sr-only">필수 입력 항목</span>
```

### 15.2 포커스 트랩 (모달)

모달이 열렸을 때 Tab 포커스가 모달 내부에서만 순환하도록 한다.

```tsx
// 모달 최초 포커스 이동
useEffect(() => {
  const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}, []);

// Esc 키로 닫기
useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [onClose]);
```

### 15.3 색상 대비 기준

| 요소 | 배경 | 텍스트 | 대비비 | 기준 |
|---|---|---|---|---|
| 본문 텍스트 | `#f8f9fa` | `#1a1a2e` | 16.8:1 | WCAG AAA |
| 기본 버튼 | `#3b82f6` | `#ffffff` | 4.56:1 | WCAG AA |
| 기한 초과 배지 | `#ef4444` | `#ffffff` | 5.25:1 | WCAG AA |
| 카테고리 배지 | `#93c5fd` | `#1a1a2e` | 5.1:1 | WCAG AA |

---

## 부록. 클래스 조합 치트시트

```
── 레이아웃 ──────────────────────────────────────────────
페이지 배경      bg-bg-secondary min-h-screen
카드             bg-white rounded-lg shadow-card border border-border p-4
콘텐츠 최대폭    max-w-screen-xl mx-auto px-4 lg:px-8

── 텍스트 ───────────────────────────────────────────────
페이지 타이틀    text-xl font-bold text-text-primary
섹션 헤더        text-lg font-semibold text-text-primary
본문             text-sm text-text-primary
보조             text-xs text-text-secondary
에러             text-xs text-danger
완료 취소선      line-through text-text-muted

── 버튼 ─────────────────────────────────────────────────
기본(파랑)       bg-accent text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-600
성공(초록)       bg-success text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-green-600
위험(빨강)       bg-danger text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-600
고스트           border border-border text-text-secondary rounded-md px-4 py-2 text-sm font-medium hover:bg-bg-secondary

── 입력 ─────────────────────────────────────────────────
기본             w-full border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent
에러             border-danger focus:ring-danger

── 배지 ─────────────────────────────────────────────────
기한 초과        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-danger text-white
완료             inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700
기본카테고리     inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-text-secondary

── 상태 ─────────────────────────────────────────────────
로딩 스켈레톤    animate-pulse bg-gray-200 rounded
빈 상태 아이콘   text-5xl (📭)
호버 효과        hover:bg-bg-secondary transition-colors duration-fast
```

---

*문서 끝.*
