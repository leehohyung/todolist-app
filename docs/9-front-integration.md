# TodoListApp 프론트엔드 통합 가이드

**버전:** 1.0.0
**작성일:** 2026-05-14
**상태:** 초안
**참조 문서:**
- `docs/2-prd.md` — PRD v1.0.0
- `docs/3-user-scenario.md` — 사용자 시나리오
- `docs/4-project-structure-principles.md` — 프로젝트 구조 원칙
- `docs/8-wireframe.md` — 와이어프레임
- `swagger/swagger.json` — API 명세서

---

## 목차

1. [기술 스택 및 프로젝트 초기 설정](#1-기술-스택-및-프로젝트-초기-설정)
2. [디렉토리 구조](#2-디렉토리-구조)
3. [환경변수 설정](#3-환경변수-설정)
4. [디자인 시스템](#4-디자인-시스템)
5. [TypeScript 타입 정의](#5-typescript-타입-정의)
6. [API 클라이언트 (axios)](#6-api-클라이언트-axios)
7. [Zustand 스토어](#7-zustand-스토어)
8. [TanStack Query 훅](#8-tanstack-query-훅)
9. [페이지 및 라우팅](#9-페이지-및-라우팅)
10. [컴포넌트 구현 가이드](#10-컴포넌트-구현-가이드)
11. [에러 처리 패턴](#11-에러-처리-패턴)
12. [인증 흐름](#12-인증-흐름)
13. [백엔드 API 연동 요약](#13-백엔드-api-연동-요약)

---

## 1. 기술 스택 및 프로젝트 초기 설정

### 1.1 기술 스택

| 분류 | 라이브러리 | 버전 | 용도 |
|---|---|---|---|
| 프레임워크 | React | 19.x | UI 렌더링 |
| 언어 | TypeScript | 5.x | 정적 타입 |
| 빌드 도구 | Vite | 6.x | 개발 서버 / 번들링 |
| 라우팅 | React Router DOM | 7.x | SPA 라우팅 |
| HTTP 클라이언트 | axios | 1.x | API 통신 |
| 서버 상태 | TanStack Query (React Query) | 5.x | 서버 상태 캐싱/관리 |
| 클라이언트 상태 | Zustand | 5.x | 토큰·필터·UI 상태 |
| CSS | CSS Custom Properties | — | 반응형 테마 시스템 |

### 1.2 프로젝트 생성

```bash
# Vite + React + TypeScript 프로젝트 생성
npm create vite@latest frontend -- --template react-ts
cd frontend

# 핵심 의존성 설치
npm install axios zustand @tanstack/react-query react-router-dom

# 타입 지원
npm install -D @types/react @types/react-dom
```

### 1.3 main.tsx 설정

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 2. 디렉토리 구조

```
frontend/
  src/
    api/                      # axios 인스턴스 및 API 함수
      client.ts              # axios 인스턴스, 인터셉터 (토큰 주입, 401 재발급)
      auth-api.ts            # POST /auth/register, /auth/login, /auth/refresh
      todo-api.ts            # GET/POST/PATCH/DELETE /todos, PATCH /todos/:id/complete
      category-api.ts        # GET/POST/DELETE /categories
      user-api.ts            # PATCH /users/me
      types.ts               # API 요청/응답 DTO 타입

    components/
      common/
        Header.tsx           # 네비게이션 바 (로고, 메뉴, 사용자명, 로그아웃)
        Toast.tsx            # 성공/오류 토스트 메시지
        Modal.tsx            # 공통 모달 래퍼
        ConfirmDialog.tsx    # 삭제 확인 다이얼로그
        Button.tsx           # 공통 버튼 (variant: primary | danger | ghost)
        Input.tsx            # 공통 입력 필드 (에러 메시지 포함)
        Spinner.tsx          # 로딩 스피너
        EmptyState.tsx       # 빈 상태 UI (아이콘 + 메시지 + 행동 버튼)
      auth/
        LoginForm.tsx        # 로그인 폼
        SignupForm.tsx       # 회원가입 폼
      todo/
        TodoList.tsx         # 할일 리스트 (카드/테이블 전환)
        TodoItem.tsx         # 할일 카드 (체크박스, 배지, 수정/삭제)
        TodoFormModal.tsx    # 할일 등록/수정 모달
        CategoryBadge.tsx    # 카테고리 컬러 배지 (참고: 이미지의 색상 태그)
        OverdueBadge.tsx     # 기한 초과 배지 (빨간색)
      category/
        CategoryList.tsx     # 카테고리 목록 (기본/사용자 구분)
        CategoryItem.tsx     # 카테고리 행 (잠금 아이콘, 삭제 버튼)
        CategoryFormModal.tsx # 카테고리 추가 모달
      filter/
        FilterBar.tsx        # 필터 바 (카테고리·기간·완료여부)

    hooks/
      auth/
        useLogin.ts          # 로그인 Mutation
        useRegister.ts       # 회원가입 Mutation
        useRefreshToken.ts   # 토큰 재발급 Mutation
        useUpdateProfile.ts  # 프로필 수정 Mutation
      todo/
        useTodos.ts          # 할일 목록 Query
        useCreateTodo.ts     # 할일 생성 Mutation
        useUpdateTodo.ts     # 할일 수정 Mutation
        useDeleteTodo.ts     # 할일 삭제 Mutation
        useToggleComplete.ts # 완료 토글 Mutation
      category/
        useCategories.ts     # 카테고리 목록 Query
        useCreateCategory.ts # 카테고리 생성 Mutation
        useDeleteCategory.ts # 카테고리 삭제 Mutation

    pages/
      LoginPage.tsx          # /login — 로그인 화면
      SignupPage.tsx         # /signup — 회원가입 화면
      TodoListPage.tsx       # /todos — 할일 목록 메인 화면
      CategoryPage.tsx       # /categories — 카테고리 관리
      ProfilePage.tsx        # /profile — 마이페이지
      NotFoundPage.tsx       # * — 404 화면

    stores/
      auth-store.ts         # accessToken, refreshToken, userId (in-memory only)
      filter-store.ts       # categoryId, dueDate, isCompleted 필터 상태
      ui-store.ts           # 모달 열림/닫힘, 토스트 메시지

    types/
      index.ts              # 전체 타입 재익스포트
      user.ts               # User, LoginRequest, LoginResponse 등
      todo.ts               # Todo, CreateTodoRequest, UpdateTodoRequest 등
      category.ts           # Category, CreateCategoryRequest 등
      filter.ts             # TodoFilter, CompletionStatus 등

    utils/
      date-utils.ts         # formatDate, getToday, isOverdue (프론트 계산용)
      validate.ts           # validateEmail, validatePassword 등
      category-colors.ts    # 카테고리 ID → 색상 매핑 (TimeBlocks 스타일 참고)

    constants/
      api.ts                # API_BASE_URL
      messages.ts           # 모든 UI 문자열 상수
      validation.ts         # 정규식, 최소/최대 길이

    App.tsx                 # 루트 라우팅
    index.css              # CSS Custom Properties 기반 글로벌 스타일
```

---

## 3. 환경변수 설정

### .env.example

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### .env.local (Git 제외)

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### src/constants/api.ts

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const REQUEST_TIMEOUT_MS = 30_000;
```

---

## 4. 디자인 시스템

### 4.1 컬러 팔레트 (CSS Custom Properties)

TimeBlocks 앱(참고 이미지)의 부드러운 파스텔 컬러 계열을 적용한다.

```css
/* src/index.css */
:root {
  /* 배경 */
  --color-bg-primary:   #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-card:      #ffffff;

  /* 텍스트 */
  --color-text-primary:   #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted:     #9ca3af;

  /* 강조 / 액션 */
  --color-accent:   #3b82f6;   /* 파란색 — 기본 버튼, 포커스 */
  --color-success:  #22c55e;   /* 초록색 — 완료, 회원가입 버튼 */
  --color-danger:   #ef4444;   /* 빨간색 — 삭제, 기한 초과 배지 */
  --color-warning:  #f59e0b;   /* 주황색 — 경고 */

  /* 카테고리 컬러 (TimeBlocks 참고: 파스텔 계열) */
  --color-cat-blue:   #93c5fd;   /* 업무 */
  --color-cat-green:  #86efac;   /* 개인 */
  --color-cat-yellow: #fde68a;   /* 쇼핑 */
  --color-cat-purple: #c4b5fd;   /* 사용자 정의 1 */
  --color-cat-pink:   #f9a8d4;   /* 사용자 정의 2 */
  --color-cat-orange: #fdba74;   /* 사용자 정의 3 */
  --color-cat-teal:   #5eead4;   /* 사용자 정의 4 */

  /* 테두리 */
  --color-border:       #e5e7eb;
  --color-border-focus: #3b82f6;

  /* 그림자 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10);

  /* 간격 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 반경 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 타이포그래피 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs:  12px;
  --font-size-sm:  14px;
  --font-size-md:  16px;
  --font-size-lg:  18px;
  --font-size-xl:  22px;
}

/* 다크 모드 — 2차 릴리스 예비 구조 */
[data-theme="dark"] {}
```

### 4.2 반응형 브레이크포인트

```css
/* 모바일 우선 설계 */
/* 기본(Mobile): < 768px */
/* 태블릿:  768px ~ 1024px */
/* 데스크톱: > 1024px */

@media (min-width: 768px) { /* 태블릿 이상 */ }
@media (min-width: 1024px) { /* 데스크톱 이상 */ }
```

### 4.3 카테고리 컬러 매핑 유틸

TimeBlocks 참고 이미지처럼 카테고리마다 고유한 색상 배지를 표시한다.

```typescript
// src/utils/category-colors.ts
const CATEGORY_COLORS = [
  'var(--color-cat-blue)',
  'var(--color-cat-green)',
  'var(--color-cat-yellow)',
  'var(--color-cat-purple)',
  'var(--color-cat-pink)',
  'var(--color-cat-orange)',
  'var(--color-cat-teal)',
];

// 기본 카테고리 고정 색상
const DEFAULT_CATEGORY_COLOR_MAP: Record<string, string> = {
  '업무':  'var(--color-cat-blue)',
  '개인':  'var(--color-cat-green)',
  '쇼핑':  'var(--color-cat-yellow)',
};

export function getCategoryColor(name: string, index: number): string {
  if (DEFAULT_CATEGORY_COLOR_MAP[name]) {
    return DEFAULT_CATEGORY_COLOR_MAP[name];
  }
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
```

---

## 5. TypeScript 타입 정의

### src/types/user.ts

```typescript
export interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}
```

### src/types/todo.ts

```typescript
export interface Todo {
  todoId: string;
  userId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;       // "YYYY-MM-DD"
  isCompleted: boolean;
  completedAt?: string | null;   // ISO 8601
  overdue: boolean;              // 계산 속성 — 백엔드에서 반환 (DB 저장 안 함)
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  categoryId: string;
  description?: string;
  dueDate?: string;              // "YYYY-MM-DD"
}

export interface UpdateTodoRequest {
  title?: string;
  categoryId?: string;
  description?: string;
  dueDate?: string | null;
}
```

### src/types/category.ts

```typescript
export interface Category {
  categoryId: string;
  userId: string | null;         // null이면 기본 카테고리
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}
```

### src/types/filter.ts

```typescript
export type CompletionStatus = 'all' | 'completed' | 'incomplete';

export interface TodoFilter {
  categoryId?: string;
  dueDate?: string;              // "YYYY-MM-DD" — 단일 날짜 필터
  isCompleted?: boolean;
}
```

---

## 6. API 클라이언트 (axios)

### src/api/client.ts

```typescript
import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../constants/api';
import { useAuthStore } from '../stores/auth-store';

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: Zustand 메모리에서 토큰을 읽어 헤더 주입
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 → Refresh Token으로 재발급 후 원요청 재시도
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();
      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        setTokens(data.accessToken, data.refreshToken, data.user.userId);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

### src/api/auth-api.ts

```typescript
import { client } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authApi = {
  register: (body: RegisterRequest) =>
    client.post<{ user: { userId: string; email: string; name: string } }>('/auth/register', body),

  login: (body: LoginRequest) =>
    client.post<LoginResponse>('/auth/login', body),

  refresh: (refreshToken: string) =>
    client.post<LoginResponse>('/auth/refresh', { refreshToken }),
};
```

### src/api/todo-api.ts

```typescript
import { client } from './client';
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilter } from '../types';

export const todoApi = {
  getTodos: (filters?: TodoFilter) =>
    client.get<{ todos: Todo[] }>('/todos', { params: filters }),

  createTodo: (body: CreateTodoRequest) =>
    client.post<{ todo: Todo }>('/todos', body),

  updateTodo: (todoId: string, body: UpdateTodoRequest) =>
    client.patch<{ todo: Todo }>(`/todos/${todoId}`, body),

  deleteTodo: (todoId: string) =>
    client.delete(`/todos/${todoId}`),

  toggleComplete: (todoId: string) =>
    client.patch<{ todo: Todo }>(`/todos/${todoId}/complete`),
};
```

### src/api/category-api.ts

```typescript
import { client } from './client';
import type { Category, CreateCategoryRequest } from '../types';

export const categoryApi = {
  getCategories: () =>
    client.get<{ categories: Category[] }>('/categories'),

  createCategory: (body: CreateCategoryRequest) =>
    client.post<{ category: Category }>('/categories', body),

  deleteCategory: (categoryId: string) =>
    client.delete(`/categories/${categoryId}`),
};
```

### src/api/user-api.ts

```typescript
import { client } from './client';
import type { User, UpdateProfileRequest } from '../types';

export const userApi = {
  updateProfile: (body: UpdateProfileRequest) =>
    client.patch<{ user: User }>('/users/me', body),
};
```

---

## 7. Zustand 스토어

### src/stores/auth-store.ts

> **중요:** Access Token과 Refresh Token은 **Zustand 메모리(in-memory)에만 저장**한다. `localStorage`, `sessionStorage`, `Cookie` 저장 절대 금지. 페이지 새로고침 시 토큰이 초기화되어 로그인 화면으로 이동한다.

```typescript
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userName: string | null;
  isLoggedIn: boolean;
  setTokens: (accessToken: string, refreshToken: string, userId: string, userName?: string) => void;
  setUserName: (name: string) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  userId: null,
  userName: null,
  isLoggedIn: false,

  setTokens: (accessToken, refreshToken, userId, userName) =>
    set({ accessToken, refreshToken, userId, userName: userName ?? null, isLoggedIn: true }),

  setUserName: (name) => set({ userName: name }),

  clearTokens: () =>
    set({ accessToken: null, refreshToken: null, userId: null, userName: null, isLoggedIn: false }),
}));
```

### src/stores/filter-store.ts

```typescript
import { create } from 'zustand';
import type { TodoFilter, CompletionStatus } from '../types';

interface FilterState {
  categoryId: string | undefined;
  dueDate: string | undefined;
  completionStatus: CompletionStatus;
  setFilter: (partial: Partial<Pick<FilterState, 'categoryId' | 'dueDate' | 'completionStatus'>>) => void;
  resetFilter: () => void;
  toApiFilter: () => TodoFilter;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  categoryId: undefined,
  dueDate: undefined,
  completionStatus: 'all',

  setFilter: (partial) => set((s) => ({ ...s, ...partial })),

  resetFilter: () => set({ categoryId: undefined, dueDate: undefined, completionStatus: 'all' }),

  toApiFilter: (): TodoFilter => {
    const { categoryId, dueDate, completionStatus } = get();
    const filter: TodoFilter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (dueDate) filter.dueDate = dueDate;
    if (completionStatus === 'completed') filter.isCompleted = true;
    if (completionStatus === 'incomplete') filter.isCompleted = false;
    return filter;
  },
}));
```

### src/stores/ui-store.ts

```typescript
import { create } from 'zustand';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  todoFormModal: { open: boolean; editTodoId?: string };
  categoryFormModal: boolean;
  toasts: ToastMessage[];
  openTodoForm: (editTodoId?: string) => void;
  closeTodoForm: () => void;
  openCategoryForm: () => void;
  closeCategoryForm: () => void;
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  todoFormModal: { open: false },
  categoryFormModal: false,
  toasts: [],

  openTodoForm: (editTodoId) =>
    set({ todoFormModal: { open: true, editTodoId } }),

  closeTodoForm: () =>
    set({ todoFormModal: { open: false, editTodoId: undefined } }),

  openCategoryForm: () => set({ categoryFormModal: true }),
  closeCategoryForm: () => set({ categoryFormModal: false }),

  addToast: (type, message) =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), type, message }],
    })),

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
```

---

## 8. TanStack Query 훅

### 쿼리 키 컨벤션

```typescript
// src/hooks/query-keys.ts
export const QUERY_KEYS = {
  todos: (filter?: object) => ['todos', filter] as const,
  categories: () => ['categories'] as const,
};
```

### src/hooks/todo/useTodos.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { todoApi } from '../../api/todo-api';
import { useFilterStore } from '../../stores/filter-store';
import { QUERY_KEYS } from '../query-keys';

export function useTodos() {
  const toApiFilter = useFilterStore((s) => s.toApiFilter);
  const filter = toApiFilter();

  return useQuery({
    queryKey: QUERY_KEYS.todos(filter),
    queryFn: () => todoApi.getTodos(filter).then((r) => r.data.todos),
    staleTime: 1000 * 60,
  });
}
```

### src/hooks/todo/useCreateTodo.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todo-api';
import { useUiStore } from '../../stores/ui-store';
import { QUERY_KEYS } from '../query-keys';
import type { CreateTodoRequest } from '../../types';

export function useCreateTodo() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  return useMutation({
    mutationFn: (body: CreateTodoRequest) =>
      todoApi.createTodo(body).then((r) => r.data.todo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.todos() });
      addToast('success', '할일이 추가되었습니다.');
    },
    onError: () => {
      addToast('error', '할일 추가에 실패했습니다.');
    },
  });
}
```

### src/hooks/todo/useToggleComplete.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todo-api';
import { QUERY_KEYS } from '../query-keys';

export function useToggleComplete() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (todoId: string) =>
      todoApi.toggleComplete(todoId).then((r) => r.data.todo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.todos() });
    },
  });
}
```

### src/hooks/category/useCategories.ts

```typescript
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../api/category-api';
import { QUERY_KEYS } from '../query-keys';

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories(),
    queryFn: () => categoryApi.getCategories().then((r) => r.data.categories),
    staleTime: 1000 * 60 * 10, // 카테고리는 자주 변경되지 않음
  });
}
```

### src/hooks/category/useDeleteCategory.ts

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/category-api';
import { useUiStore } from '../../stores/ui-store';
import { QUERY_KEYS } from '../query-keys';

export function useDeleteCategory() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  return useMutation({
    mutationFn: (categoryId: string) => categoryApi.deleteCategory(categoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.categories() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.todos() });
      addToast('success', '카테고리가 삭제되었습니다.');
    },
    onError: () => {
      addToast('error', '카테고리 삭제에 실패했습니다.');
    },
  });
}
```

---

## 9. 페이지 및 라우팅

### src/App.tsx

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TodoListPage from './pages/TodoListPage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* 비인증 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 인증 필수 라우트 */}
      <Route path="/todos" element={<PrivateRoute><TodoListPage /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

      {/* 기본 리다이렉트 */}
      <Route path="/" element={<Navigate to="/todos" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

### 화면별 경로 요약

| 화면 ID | 경로 | 인증 | 연관 시나리오 |
|---|---|---|---|
| P-01 | `/login` | 불필요 | SC-02 |
| P-02 | `/signup` | 불필요 | SC-01 |
| P-03 | `/todos` | 필요 | SC-06 ~ SC-10 |
| P-04 | `/categories` | 필요 | SC-04, SC-05 |
| P-05 | `/profile` | 필요 | SC-03 |
| P-06 | `*` | 공개 | — |

---

## 10. 컴포넌트 구현 가이드

### 10.1 CategoryBadge — 카테고리 컬러 배지

TimeBlocks 참고 이미지의 색상 태그처럼 각 카테고리에 고유한 컬러를 부여한다.

```tsx
// src/components/todo/CategoryBadge.tsx
import { getCategoryColor } from '../../utils/category-colors';

interface Props {
  name: string;
  index: number;   // 카테고리 목록에서의 순서 (색상 결정용)
}

export function CategoryBadge({ name, index }: Props) {
  const color = getCategoryColor(name, index);
  return (
    <span
      style={{
        backgroundColor: color,
        borderRadius: 'var(--radius-full)',
        padding: '2px 10px',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        color: '#1a1a2e',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </span>
  );
}
```

### 10.2 TodoItem — 할일 카드

```tsx
// src/components/todo/TodoItem.tsx
import type { Todo } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { OverdueBadge } from './OverdueBadge';

interface Props {
  todo: Todo;
  categoryName: string;
  categoryIndex: number;
  onToggle: (todoId: string) => void;
  onEdit: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}

export function TodoItem({ todo, categoryName, categoryIndex, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className={`todo-item ${todo.isCompleted ? 'completed' : ''} ${todo.overdue ? 'overdue' : ''}`}>
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggle(todo.todoId)}
        aria-label={`${todo.title} 완료 토글`}
      />
      <div className="todo-item__body">
        <span className={`todo-item__title ${todo.isCompleted ? 'line-through' : ''}`}>
          {todo.title}
        </span>
        <div className="todo-item__meta">
          <CategoryBadge name={categoryName} index={categoryIndex} />
          {todo.dueDate && (
            <span className={`todo-item__due ${todo.overdue ? 'text-danger' : ''}`}>
              {todo.dueDate}
            </span>
          )}
          {todo.overdue && <OverdueBadge />}
        </div>
      </div>
      <div className="todo-item__actions">
        <button onClick={() => onEdit(todo.todoId)} aria-label="수정">수정</button>
        <button onClick={() => onDelete(todo.todoId)} aria-label="삭제" className="btn-danger">삭제</button>
      </div>
    </div>
  );
}
```

### 10.3 OverdueBadge — 기한 초과 표시

```tsx
// src/components/todo/OverdueBadge.tsx
export function OverdueBadge() {
  return (
    <span
      style={{
        backgroundColor: 'var(--color-danger)',
        color: '#ffffff',
        borderRadius: 'var(--radius-full)',
        padding: '2px 8px',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
      }}
    >
      기한 초과
    </span>
  );
}
```

### 10.4 TodoFormModal — 할일 등록/수정 모달

```tsx
// src/components/todo/TodoFormModal.tsx
import { useState } from 'react';
import type { Todo, CreateTodoRequest } from '../../types';
import { useCategories } from '../../hooks/category/useCategories';

interface Props {
  editTodo?: Todo;
  onSubmit: (data: CreateTodoRequest) => void;
  onClose: () => void;
}

export function TodoFormModal({ editTodo, onSubmit, onClose }: Props) {
  const { data: categories } = useCategories();
  const [title, setTitle] = useState(editTodo?.title ?? '');
  const [categoryId, setCategoryId] = useState(editTodo?.categoryId ?? '');
  const [description, setDescription] = useState(editTodo?.description ?? '');
  const [dueDate, setDueDate] = useState(editTodo?.dueDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = '제목은 필수 입력 항목입니다.';
    if (!categoryId) errs.categoryId = '카테고리를 선택해 주세요.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ title: title.trim(), categoryId, description: description || undefined, dueDate: dueDate || undefined });
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-box">
        <header className="modal-header">
          <h2 id="modal-title">{editTodo ? '할일 수정' : '할일 추가'}</h2>
          <button onClick={onClose} aria-label="닫기">✕</button>
        </header>
        <form onSubmit={handleSubmit}>
          <label>
            제목 <span className="required">*</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>

          <label>
            설명 (선택)
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>

          <label>
            카테고리 <span className="required">*</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">카테고리 선택</option>
              {categories?.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
          </label>

          <label>
            마감일 (선택)
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary">{editTodo ? '저장' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 10.5 CategoryItem — 카테고리 관리 행

TimeBlocks 참고 이미지의 카테고리 관리 화면(색상 체크박스 + 설정 아이콘)을 참고한다.

```tsx
// src/components/category/CategoryItem.tsx
import type { Category } from '../../types';
import { getCategoryColor } from '../../utils/category-colors';

interface Props {
  category: Category;
  index: number;
  onDelete?: (categoryId: string) => void;
}

export function CategoryItem({ category, index, onDelete }: Props) {
  const color = getCategoryColor(category.name, index);

  return (
    <div className="category-item">
      {/* TimeBlocks 스타일 컬러 체크박스 */}
      <span
        className="category-item__color-dot"
        style={{ backgroundColor: color, borderRadius: 'var(--radius-sm)' }}
      />
      <span className="category-item__name">{category.name}</span>
      {category.isDefault ? (
        <span className="category-item__lock" title="기본 카테고리 — 삭제 불가">🔒</span>
      ) : (
        <button
          className="category-item__delete btn-danger"
          onClick={() => onDelete?.(category.categoryId)}
          aria-label={`${category.name} 카테고리 삭제`}
        >
          삭제
        </button>
      )}
    </div>
  );
}
```

### 10.6 FilterBar — 할일 필터

```tsx
// src/components/filter/FilterBar.tsx
import { useFilterStore } from '../../stores/filter-store';
import { useCategories } from '../../hooks/category/useCategories';
import type { CompletionStatus } from '../../types';

export function FilterBar() {
  const { categoryId, dueDate, completionStatus, setFilter, resetFilter } = useFilterStore();
  const { data: categories } = useCategories();

  return (
    <div className="filter-bar">
      {/* 카테고리 필터 */}
      <label className="filter-bar__field">
        카테고리
        <select
          value={categoryId ?? ''}
          onChange={(e) => setFilter({ categoryId: e.target.value || undefined })}
        >
          <option value="">전체</option>
          {categories?.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
          ))}
        </select>
      </label>

      {/* 마감일 필터 */}
      <label className="filter-bar__field">
        마감일
        <input
          type="date"
          value={dueDate ?? ''}
          onChange={(e) => setFilter({ dueDate: e.target.value || undefined })}
        />
      </label>

      {/* 완료 여부 */}
      <fieldset className="filter-bar__field">
        <legend>완료 여부</legend>
        {(['all', 'completed', 'incomplete'] as CompletionStatus[]).map((v) => (
          <label key={v}>
            <input
              type="radio"
              name="completion"
              value={v}
              checked={completionStatus === v}
              onChange={() => setFilter({ completionStatus: v })}
            />
            {v === 'all' ? '전체' : v === 'completed' ? '완료됨' : '미완료'}
          </label>
        ))}
      </fieldset>

      <button onClick={resetFilter} className="btn-ghost">초기화</button>
    </div>
  );
}
```

---

## 11. 에러 처리 패턴

### 11.1 API 에러 구조

백엔드 에러 응답은 항상 아래 형식으로 반환된다.

```json
{ "error": { "code": "INVALID_INPUT", "message": "할일 제목을 입력해주세요." } }
```

### 11.2 에러 코드 매핑

```typescript
// src/constants/error-codes.ts
export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;
```

### 11.3 에러 유틸

```typescript
// src/utils/api-error.ts
import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.error?.message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
```

### 11.4 Mutation에서 에러 메시지 사용

```typescript
import { getApiErrorMessage } from '../../utils/api-error';

// useMutation onError:
onError: (error) => {
  addToast('error', getApiErrorMessage(error, '할일 추가에 실패했습니다.'));
}
```

---

## 12. 인증 흐름

### 12.1 로그인 흐름 (SC-02)

```
1. LoginPage → useLogin mutate({ email, password })
2. POST /auth/login → { accessToken, refreshToken, user }
3. useAuthStore.setTokens(accessToken, refreshToken, user.userId, user.name)
4. navigate('/todos')
```

### 12.2 토큰 자동 갱신

```
API 요청 → 401 응답
  → client.ts 인터셉터 실행
  → POST /auth/refresh { refreshToken }
  → 새 accessToken 발급 → 스토어 업데이트
  → 원래 요청 재시도
  → 갱신 실패 시 clearTokens() → /login 리다이렉트
```

### 12.3 로그아웃

```typescript
// 클라이언트 측 토큰만 삭제 (서버 호출 없음 — PRD 명시)
const { clearTokens } = useAuthStore();
clearTokens();
navigate('/login');
```

### 12.4 페이지 새로고침 처리

Zustand는 in-memory 스토어이므로 새로고침 시 토큰이 초기화되어 `/login`으로 리다이렉트된다. `App.tsx`의 `PrivateRoute`가 이를 처리한다.

---

## 13. 백엔드 API 연동 요약

### 13.1 엔드포인트 목록

| Method | 경로 | 인증 | 설명 |
|---|---|---|---|
| POST | `/auth/register` | 불필요 | 회원가입 |
| POST | `/auth/login` | 불필요 | 로그인, JWT 발급 |
| POST | `/auth/refresh` | 불필요 | Access Token 재발급 |
| PATCH | `/users/me` | 필요 | 개인정보 수정 |
| GET | `/categories` | 필요 | 카테고리 목록 (기본+사용자) |
| POST | `/categories` | 필요 | 카테고리 생성 |
| DELETE | `/categories/:categoryId` | 필요 | 카테고리 삭제 (할일 재분류 포함) |
| GET | `/todos` | 필요 | 할일 목록 (필터: categoryId, dueDate, isCompleted) |
| POST | `/todos` | 필요 | 할일 생성 |
| PATCH | `/todos/:todoId` | 필요 | 할일 수정 |
| DELETE | `/todos/:todoId` | 필요 | 할일 삭제 |
| PATCH | `/todos/:todoId/complete` | 필요 | 완료 여부 토글 |

### 13.2 주요 필드 주의사항

| 항목 | 내용 |
|---|---|
| ID 형식 | 모든 ID는 **UUID** 문자열 (정수 아님) |
| Todo 설명 필드 | 요청/응답 모두 **`description`** 사용 (memo 아님) |
| overdue 필드 | 백엔드에서 계산하여 응답에 포함 (DB 저장 안 함). `dueDate < 오늘 AND isCompleted = false` 조건. UTC 기준 날짜 문자열 비교. |
| 토큰 헤더 | `Authorization: Bearer <accessToken>` |
| 에러 포맷 | `{ "error": { "code": "...", "message": "..." } }` |
| 카테고리 삭제 | 해당 카테고리의 할일은 자동으로 기본 카테고리 "개인"으로 재분류 |

### 13.3 Swagger UI

로컬 개발 중 API 명세 확인:
```
http://localhost:3000/api-docs
```

---

## 부록 A. UI 컴포넌트 우선순위

| 우선순위 | 컴포넌트 | 관련 시나리오 |
|---|---|---|
| 높음 | LoginForm, SignupForm | SC-01, SC-02 |
| 높음 | TodoList, TodoItem, TodoFormModal | SC-06 ~ SC-10 |
| 높음 | FilterBar | SC-10 |
| 높음 | CategoryBadge, OverdueBadge | SC-10 |
| 중간 | CategoryList, CategoryItem, CategoryFormModal | SC-04, SC-05 |
| 중간 | Header, Toast, ConfirmDialog | 공통 |
| 낮음 | ProfilePage (이름·비밀번호 수정) | SC-03 |
| 낮음 | NotFoundPage, EmptyState | 공통 |

## 부록 B. 모바일 최적화 체크리스트

- [ ] 터치 타겟 최소 44×44px
- [ ] 입력 필드 `font-size: 16px` 이상 (iOS 자동 줌 방지)
- [ ] 필터 바 — 모바일에서 아코디언(접힘/펼침) 적용
- [ ] 할일 목록 — 모바일 카드, 데스크톱 테이블 전환
- [ ] 모달 너비 — 모바일 90vw, 데스크톱 500px
- [ ] 하단 고정 "할일 추가" 버튼 (`position: fixed; bottom: 24px`)
- [ ] 토스트 메시지 — 화면 상단 고정, 2초 자동 닫기

## 부록 C. 접근성 체크리스트

- [ ] 모달: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] 체크박스: `aria-label` 포함 (할일 제목 언급)
- [ ] 폼 오류: `aria-describedby`로 에러 메시지 연결
- [ ] 키보드: Tab(이동), Enter(제출), Esc(모달 닫기) 지원
- [ ] 색상 대비: WCAG AA 기준 4.5:1 이상

---

*문서 끝.*
