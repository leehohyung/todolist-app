# TodoListApp 실행계획

**버전:** 1.0.0  
**작성일:** 2026-05-13  
**참조:** docs/2-prd.md, docs/4-project-structure-principles.md, docs/6-erd.md, database/schema.sql

---

## 개요

본 문서는 TodoListApp 1차 릴리스(MVP) 구현을 위한 전체 실행계획이다.  
DB → 백엔드 → 프론트엔드 순서로 의존성을 고려하여 단계별로 작업을 분해한다.

### 기술 스택 요약

| 영역 | 기술 |
|---|---|
| DB | PostgreSQL 17, pg (node-postgres) |
| 백엔드 | Node.js, Express, TypeScript, JWT |
| 프론트엔드 | React 19, TypeScript, Zustand (in-memory), TanStack Query, Axios |

### 완료 조건 정의

- **[ ]** 미완료
- **[x]** 완료
- 각 Task의 완료 조건은 "Done When" 항목으로 명시

---

## 전체 실행 단계 (Phase Map)

```
Phase 1: 프로젝트 환경 설정          (DB + BE + FE 동시)
Phase 2: DB 연결 및 레포지토리       (BE)
Phase 3: 백엔드 서비스 & API         (BE)
Phase 4: 프론트엔드 인프라           (FE)
Phase 5: 프론트엔드 컴포넌트 & 페이지 (FE)
Phase 6: 통합 테스트 & 검증          (공통)
```

---

## PHASE 1: 프로젝트 환경 설정

> **전제:** Phase 1은 DB, 백엔드, 프론트엔드를 병렬로 진행할 수 있다.

---

### 1-DB: 데이터베이스 환경 설정

#### DB-P1-01: PostgreSQL 환경 준비
- **의존성:** 없음
- **Done When:**
  - [ ] PostgreSQL 17 로컬 설치 및 실행 확인 (`psql --version`)
  - [ ] `todolist_dev` DB 생성 (`createdb todolist_dev`)
  - [ ] `todolist_test` DB 생성 (`createdb todolist_test`)
  - [ ] `database/schema.sql` 적용 완료 (`psql -d todolist_dev -f database/schema.sql`)
  - [ ] 기본 카테고리 3건(업무, 개인, 쇼핑) 삽입 확인 (`SELECT * FROM categories WHERE is_default = true` → 3 rows)

> **참고:** `database/schema.sql`은 이미 작성 완료. 테이블 3개, 인덱스 6개, 트리거 2개, 기본 카테고리 시드 데이터 포함.

---

### 1-BE: 백엔드 프로젝트 초기 설정

#### BE-P1-01: 프로젝트 스캐폴딩
- **의존성:** 없음
- **Done When:**
  - [ ] `backend/` 디렉터리 생성 및 `npm init` 완료
  - [ ] TypeScript, ts-node, tsx 설치 (`npm i -D typescript ts-node @types/node`)
  - [ ] `tsconfig.json` strict mode 설정 완료
  - [ ] `package.json` scripts 구성: `dev`, `build`, `start`, `test`

#### BE-P1-02: 의존성 패키지 설치
- **의존성:** BE-P1-01
- **Done When:**
  - [ ] 프로덕션 패키지 설치: `express pg bcrypt jsonwebtoken cors dotenv`
  - [ ] 타입 패키지 설치: `@types/express @types/pg @types/bcrypt @types/jsonwebtoken @types/cors`
  - [ ] 테스트 패키지 설치: `jest ts-jest @types/jest supertest @types/supertest`
  - [ ] `package.json`에 모든 패키지 반영 확인

#### BE-P1-03: 디렉터리 구조 생성
- **의존성:** BE-P1-01
- **Done When:**
  - [ ] 다음 디렉터리 구조 생성 완료:
    ```
    backend/src/
    ├── config/
    ├── constants/
    ├── controllers/
    ├── db/
    ├── middlewares/
    ├── repositories/
    ├── routes/
    ├── services/
    ├── types/
    └── utils/
    ```

#### BE-P1-04: 환경변수 설정
- **의존성:** BE-P1-01
- **Done When:**
  - [ ] `.env.example` 파일 생성 (아래 변수 포함):
    ```
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=todolist_dev
    DB_USER=postgres
    DB_PASSWORD=
    JWT_SECRET=
    JWT_REFRESH_SECRET=
    PORT=3000
    NODE_ENV=development
    CORS_ORIGIN=http://localhost:5173
    ```
  - [ ] `.env` 파일 생성 및 실제 값 설정 (`.gitignore`에 포함 확인)
  - [ ] `src/config/index.ts` 작성: 환경변수 로드 및 필수값 누락 시 startup fail

#### BE-P1-05: 에러 코드 & 메시지 상수 정의
- **의존성:** BE-P1-01
- **Done When:**
  - [ ] `src/constants/error-codes.ts` 작성:
    - `UNAUTHORIZED`, `INVALID_TOKEN`, `INVALID_INPUT`, `DUPLICATE_EMAIL`, `NOT_FOUND`, `FORBIDDEN`, `INTERNAL_SERVER_ERROR`
  - [ ] `src/types/errors.ts` 작성: `AppError` 클래스 (code, statusCode, message)

---

### 1-FE: 프론트엔드 프로젝트 초기 설정

#### FE-P1-01: Vite + React 19 프로젝트 생성
- **의존성:** 없음
- **Done When:**
  - [ ] `frontend/` 디렉터리에 Vite + React + TypeScript 템플릿 생성
  - [ ] `tsconfig.json` strict mode 설정 완료
  - [ ] 개발 서버 실행 확인 (`npm run dev` → localhost:5173)

#### FE-P1-02: 의존성 패키지 설치
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] 설치 완료: `axios zustand @tanstack/react-query react-router-dom`
  - [ ] 타입 패키지 설치: `@types/react @types/react-dom`
  - [ ] `package.json`에 모든 패키지 반영 확인

#### FE-P1-03: 디렉터리 구조 생성
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] 다음 디렉터리 구조 생성 완료:
    ```
    frontend/src/
    ├── api/
    ├── components/
    │   ├── auth/
    │   ├── category/
    │   ├── common/
    │   ├── filter/
    │   └── todo/
    ├── constants/
    ├── hooks/
    │   ├── auth/
    │   ├── category/
    │   ├── todo/
    │   └── user/
    ├── pages/
    ├── stores/
    ├── types/
    └── utils/
    ```

#### FE-P1-04: 환경변수 설정
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] `.env.example` 생성: `VITE_API_BASE_URL=http://localhost:3000/api/v1`
  - [ ] `.env.local` 생성 및 값 설정 (`.gitignore`에 포함 확인)

#### FE-P1-05: CSS Custom Properties (테마 변수) 설정
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] `src/index.css`에 CSS 변수 정의 완료:
    ```css
    :root {
      --color-bg-primary: #ffffff;
      --color-bg-secondary: #f5f5f5;
      --color-text-primary: #1a1a1a;
      --color-text-secondary: #6b7280;
      --color-border: #e5e7eb;
      --color-accent: #3b82f6;
      --color-danger: #ef4444;
      --color-success: #22c55e;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
    }
    /* dark mode 예비 구조 (2차 릴리스) */
    [data-theme="dark"] {}
    ```
  - [ ] 모바일 우선 기본 스타일 (reset, 기본 타이포그래피) 설정 완료
  - [ ] 반응형 브레이크포인트 정의: 768px, 1024px

#### FE-P1-06: 타입 정의
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] `src/types/user.ts` 작성: `User`, `LoginRequest`, `LoginResponse`
  - [ ] `src/types/todo.ts` 작성: `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`
  - [ ] `src/types/category.ts` 작성: `Category`, `CreateCategoryRequest`
  - [ ] `src/types/filter.ts` 작성: `TodoFilter`, `CompletionStatus`
  - [ ] `src/types/index.ts` 작성: 전체 타입 재익스포트

#### FE-P1-07: 상수 파일 작성
- **의존성:** FE-P1-06
- **Done When:**
  - [ ] `src/constants/messages.ts` 작성: 모든 UI 문자열 상수화 (AUTH, TODO, CATEGORY, VALIDATION 섹션)
  - [ ] `src/constants/validation.ts` 작성: 정규식, 최대 길이 상수
  - [ ] `src/constants/api.ts` 작성: API_BASE_URL, REQUEST_TIMEOUT_MS

#### FE-P1-08: 유틸리티 함수 작성
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] `src/utils/date-utils.ts` 작성: `formatDate`, `getToday`, `isOverdue`, `formatDateRange`
  - [ ] `src/utils/validate.ts` 작성: `validateEmail`, `validatePassword`, `validatePasswordMatch`, `validateTodoTitle`, `validateCategoryName`
  - [ ] `src/utils/storage.ts` 작성: localStorage 유틸 (비토큰 데이터 전용, 토큰 저장 금지)

---

## PHASE 2: DB 연결 및 레포지토리

> **전제:** Phase 1 DB, Phase 1 BE 완료 후 진행

---

### BE-P2-01: PostgreSQL 연결 풀 설정
- **의존성:** BE-P1-04, DB-P1-01
- **Done When:**
  - [ ] `src/db/pool.ts` 작성: `pg.Pool` 인스턴스 생성 (환경변수 기반)
  - [ ] pool 에러 핸들러 등록 (`pool.on('error', ...)`)
  - [ ] `src/server.ts`에서 시작 시 `SELECT 1` 연결 테스트 수행
  - [ ] DB 연결 성공/실패 로그 출력

### BE-P2-02: UserRepository 구현
- **의존성:** BE-P2-01
- **Done When:**
  - [ ] `src/repositories/user-repository.ts` 작성
  - [ ] 구현 메서드:
    - [ ] `findByEmail(email): Promise<User | null>`
    - [ ] `findById(userId): Promise<User | null>`
    - [ ] `create(email, hashedPassword, name): Promise<User>`
    - [ ] `updateName(userId, name): Promise<User>`
    - [ ] `updatePassword(userId, hashedPassword): Promise<void>`
    - [ ] `delete(userId): Promise<void>`
  - [ ] 모든 쿼리 파라미터 바인딩 (`$1, $2, ...`) 사용 (문자열 연결 금지)
  - [ ] DB 컬럼명(snake_case) → 반환 객체(camelCase) 변환은 Repository에서만 수행

### BE-P2-03: CategoryRepository 구현
- **의존성:** BE-P2-01
- **Done When:**
  - [ ] `src/repositories/category-repository.ts` 작성
  - [ ] 구현 메서드:
    - [ ] `findAllForUser(userId): Promise<Category[]>` (기본 + 사용자정의 통합)
    - [ ] `findById(categoryId): Promise<Category | null>`
    - [ ] `findDefaultByName(name): Promise<Category | null>`
    - [ ] `create(userId, name): Promise<Category>`
    - [ ] `delete(categoryId): Promise<void>`
    - [ ] `reclassifyTodos(fromCategoryId, toCategoryId): Promise<void>` (할일 카테고리 일괄 변경)

### BE-P2-04: TodoRepository 구현
- **의존성:** BE-P2-01
- **Done When:**
  - [ ] `src/repositories/todo-repository.ts` 작성
  - [ ] 구현 메서드:
    - [ ] `findById(todoId): Promise<Todo | null>`
    - [ ] `findByIdAndUserId(todoId, userId): Promise<Todo | null>` (소유 검증)
    - [ ] `findAllByUserId(userId, filters?): Promise<Todo[]>` (동적 필터 쿼리)
    - [ ] `create(userId, data): Promise<Todo>`
    - [ ] `update(todoId, data): Promise<Todo>`
    - [ ] `updateCompletion(todoId, isCompleted): Promise<Todo>`
      - isCompleted=true → `completed_at = now()`
      - isCompleted=false → `completed_at = NULL`
    - [ ] `delete(todoId): Promise<void>`
  - [ ] 동적 쿼리(필터) 빌드 시 파라미터 바인딩 사용

---

## PHASE 3: 백엔드 서비스 & API

> **전제:** Phase 2 완료 후 진행

---

### BE-P3-01: JWT 유틸리티 작성
- **의존성:** BE-P1-04
- **Done When:**
  - [ ] `src/utils/jwt.ts` 작성:
    - [ ] `generateAccessToken(userId)` — 1시간 만료, JWT_SECRET
    - [ ] `generateRefreshToken(userId)` — 7일 만료, JWT_REFRESH_SECRET
    - [ ] `verifyAccessToken(token)` — 서명 검증, 페이로드 반환
    - [ ] `verifyRefreshToken(token)` — 서명 검증, 페이로드 반환

### BE-P3-02: 비밀번호 유틸리티 작성
- **의존성:** BE-P1-01
- **Done When:**
  - [ ] `src/utils/password.ts` 작성:
    - [ ] `hashPassword(password)` — bcrypt, saltRounds ≥ 10
    - [ ] `comparePassword(plain, hashed)` — bcrypt compare

### BE-P3-03: 인증 미들웨어 구현
- **의존성:** BE-P3-01
- **Done When:**
  - [ ] `src/middlewares/auth-middleware.ts` 작성
  - [ ] `Authorization: Bearer <token>` 헤더 파싱
  - [ ] 토큰 유효 시 `req.userId` 설정 후 `next()` 호출
  - [ ] 토큰 없음 → 401 `UNAUTHORIZED`
  - [ ] 토큰 유효하지 않음 → 401 `INVALID_TOKEN`

### BE-P3-04: 에러 핸들러 미들웨어 구현
- **의존성:** BE-P1-05
- **Done When:**
  - [ ] `src/middlewares/error-handler.ts` 작성
  - [ ] `AppError` 인스턴스 → statusCode + code + message 응답
  - [ ] 일반 에러 → 500 `INTERNAL_SERVER_ERROR`
  - [ ] 스택 트레이스 클라이언트 노출 금지
  - [ ] 응답 형식: `{ error: { code, message } }`

### BE-P3-05: AuthService 구현
- **의존성:** BE-P2-02, BE-P3-01, BE-P3-02
- **Done When:**
  - [ ] `src/services/auth-service.ts` 작성
  - [ ] 구현 메서드:
    - [ ] `register(email, password, name)` — BR-01: 이메일 중복 확인, BR-02: 비밀번호 해싱
    - [ ] `login(email, password)` — 이메일/비밀번호 검증, 토큰 쌍 발급
    - [ ] `refreshTokens(refreshToken)` — 리프레시 토큰 검증 후 새 토큰 쌍 발급

### BE-P3-06: UserService 구현
- **의존성:** BE-P2-02, BE-P3-02
- **Done When:**
  - [ ] `src/services/user-service.ts` 작성
  - [ ] `updateProfile(userId, { name?, currentPassword?, newPassword? })` 구현
    - [ ] 이름 변경: name 제공 시 업데이트
    - [ ] 비밀번호 변경: currentPassword 확인 후 newPassword 해싱 및 저장

### BE-P3-07: CategoryService 구현
- **의존성:** BE-P2-03
- **Done When:**
  - [ ] `src/services/category-service.ts` 작성
  - [ ] 구현 메서드:
    - [ ] `getCategoriesForUser(userId)` — 기본 카테고리 + 사용자 카테고리 통합 반환
    - [ ] `createCategory(userId, name)` — 이름 유효성 검사 후 생성
    - [ ] `deleteCategory(userId, categoryId)` — BR-07: 소유 검증, BR-08: 할일 '개인' 카테고리로 재분류 후 삭제

### BE-P3-08: TodoService 구현
- **의존성:** BE-P2-04, BE-P3-07
- **Done When:**
  - [ ] `src/services/todo-service.ts` 작성
  - [ ] 구현 메서드:
    - [ ] `createTodo(userId, data)` — BR-09: title/categoryId 필수 검증, 카테고리 소유 검증
    - [ ] `updateTodo(userId, todoId, data)` — BR-10: 소유 검증 후 업데이트
    - [ ] `deleteTodo(userId, todoId)` — BR-10: 소유 검증 후 삭제
    - [ ] `toggleCompletion(userId, todoId)` — BR-11: isCompleted 토글, completedAt 자동 처리
    - [ ] `getTodos(userId, filters)` — BR-13: 카테고리/날짜/완료 여부 필터 지원
    - [ ] `calculateOverdueStatus(todo)` — BR-12: dueDate < today AND !isCompleted → 'overdue' (계산 속성)

### BE-P3-09: Controller 구현
- **의존성:** BE-P3-05, BE-P3-06, BE-P3-07, BE-P3-08
- **Done When:**
  - [ ] `src/controllers/auth-controller.ts` 작성: `register`, `login`, `refreshToken`
  - [ ] `src/controllers/user-controller.ts` 작성: `updateProfile`
  - [ ] `src/controllers/category-controller.ts` 작성: `getCategories`, `createCategory`, `deleteCategory`
  - [ ] `src/controllers/todo-controller.ts` 작성: `getTodos`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleCompletion`
  - [ ] 모든 응답 형식 통일:
    - 성공: HTTP 2xx + JSON 데이터
    - 실패: `{ error: { code, message } }`

### BE-P3-10: Router 구현
- **의존성:** BE-P3-09, BE-P3-03
- **Done When:**
  - [ ] `src/routes/auth-routes.ts` 작성:
    - [ ] `POST /api/v1/auth/register` (비인증)
    - [ ] `POST /api/v1/auth/login` (비인증)
    - [ ] `POST /api/v1/auth/refresh` (비인증)
  - [ ] `src/routes/user-routes.ts` 작성:
    - [ ] `PATCH /api/v1/users/me` (인증 필요)
  - [ ] `src/routes/category-routes.ts` 작성:
    - [ ] `GET /api/v1/categories` (인증 필요)
    - [ ] `POST /api/v1/categories` (인증 필요)
    - [ ] `DELETE /api/v1/categories/:categoryId` (인증 필요)
  - [ ] `src/routes/todo-routes.ts` 작성:
    - [ ] `GET /api/v1/todos` (인증 필요, 쿼리: `categoryId`, `startDate`, `endDate`, `isCompleted`)
    - [ ] `POST /api/v1/todos` (인증 필요)
    - [ ] `PATCH /api/v1/todos/:todoId` (인증 필요)
    - [ ] `DELETE /api/v1/todos/:todoId` (인증 필요)
    - [ ] `PATCH /api/v1/todos/:todoId/complete` (인증 필요)

### BE-P3-11: Express 앱 & 서버 진입점 구현
- **의존성:** BE-P3-10, BE-P3-04
- **Done When:**
  - [ ] `src/app.ts` 작성:
    - [ ] `express.json()` 미들웨어 등록
    - [ ] CORS 미들웨어 등록 (origin = env CORS_ORIGIN)
    - [ ] 라우터 마운트 (`/api/v1/auth`, `/api/v1/users`, `/api/v1/categories`, `/api/v1/todos`)
    - [ ] 에러 핸들러 미들웨어 마지막에 등록
  - [ ] `src/server.ts` 작성:
    - [ ] DB 연결 확인 후 서버 시작
    - [ ] `PORT` 환경변수 기반 포트 바인딩
  - [ ] `npm run dev` 실행 시 서버 정상 시작 확인

---

## PHASE 4: 프론트엔드 인프라

> **전제:** Phase 1 FE 완료 후 진행. Phase 3과 병렬 진행 가능.

---

### FE-P4-01: Zustand 스토어 구현
- **의존성:** FE-P1-06
- **Done When:**
  - [ ] `src/stores/auth-store.ts` 작성:
    ```typescript
    // persist 미들웨어 사용 금지 — 메모리 전용
    export const useAuthStore = create<AuthState>((set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isLoggedIn: false,
      setTokens: (accessToken, refreshToken, userId) =>
        set({ accessToken, refreshToken, userId, isLoggedIn: true }),
      clearTokens: () =>
        set({ accessToken: null, refreshToken: null, userId: null, isLoggedIn: false }),
    }));
    ```
  - [ ] `src/stores/filter-store.ts` 작성: `categoryId`, `startDate`, `endDate`, `isCompleted` 필터 상태 + `setFilter`, `resetFilters`
  - [ ] `src/stores/ui-store.ts` 작성: `isModalOpen`, `modalType`, `showConfirmDialog` 상태 및 액션

### FE-P4-02: Axios API 클라이언트 구현
- **의존성:** FE-P4-01, FE-P1-07
- **Done When:**
  - [ ] `src/api/client.ts` 작성:
    - [ ] `baseURL = VITE_API_BASE_URL`, `timeout = 30000`
    - [ ] 요청 인터셉터: `useAuthStore.getState().accessToken` → `Authorization: Bearer` 헤더 주입
    - [ ] 응답 인터셉터:
      - [ ] 401 수신 시 refreshToken으로 POST `/auth/refresh` 호출
      - [ ] 토큰 갱신 성공 → 스토어 업데이트 → 원본 요청 재시도
      - [ ] 토큰 갱신 실패 → `clearTokens()` → `/login`으로 리다이렉트

### FE-P4-03: API 함수 구현
- **의존성:** FE-P4-02, FE-P1-06
- **Done When:**
  - [ ] `src/api/auth-api.ts`: `register`, `login`, `refreshToken`
  - [ ] `src/api/category-api.ts`: `getCategories`, `createCategory`, `deleteCategory`
  - [ ] `src/api/todo-api.ts`: `getTodos(filters?)`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleTodoComplete`
  - [ ] `src/api/user-api.ts`: `updateProfile`

### FE-P4-04: TanStack Query 설정
- **의존성:** FE-P1-01
- **Done When:**
  - [ ] `src/main.tsx`에 `QueryClientProvider` 래핑
  - [ ] `QueryClient` 기본 설정: `staleTime`, `cacheTime`, `retry` 옵션 설정
  - [ ] ReactDOM 렌더링 with `StrictMode`

### FE-P4-05: 커스텀 훅 구현 — 인증
- **의존성:** FE-P4-02, FE-P4-03, FE-P4-01
- **Done When:**
  - [ ] `src/hooks/auth/useLogin.ts`: `useMutation` — 성공 시 토큰 저장 + `/todos` 이동
  - [ ] `src/hooks/auth/useRegister.ts`: `useMutation` — 성공 시 `/login` 이동
  - [ ] `src/hooks/auth/useLogout.ts`: `clearTokens()` + `/login` 이동
  - [ ] `src/hooks/auth/useAuth.ts`: `useAuthStore`에서 `isLoggedIn`, `userId` 파생
  - [ ] `src/hooks/auth/useUpdateProfile.ts`: `useMutation` — 프로필 수정

### FE-P4-06: 커스텀 훅 구현 — Todo
- **의존성:** FE-P4-03, FE-P4-01
- **Done When:**
  - [ ] `src/hooks/todo/useTodoList.ts`: `useQuery(['todos', filters])` — `filter-store`에 반응
  - [ ] `src/hooks/todo/useCreateTodo.ts`: `useMutation` — 성공 시 `['todos']` 캐시 무효화
  - [ ] `src/hooks/todo/useUpdateTodo.ts`: `useMutation` — 성공 시 캐시 무효화
  - [ ] `src/hooks/todo/useDeleteTodo.ts`: `useMutation` — 성공 시 캐시 무효화
  - [ ] `src/hooks/todo/useCompleteTodo.ts`: `useMutation` — 낙관적 업데이트 (Optimistic Update)

### FE-P4-07: 커스텀 훅 구현 — Category
- **의존성:** FE-P4-03
- **Done When:**
  - [ ] `src/hooks/category/useCategories.ts`: `useQuery(['categories'])` — staleTime 5분
  - [ ] `src/hooks/category/useCreateCategory.ts`: `useMutation` — 성공 시 `['categories']` 무효화
  - [ ] `src/hooks/category/useDeleteCategory.ts`: `useMutation` — 성공 시 `['categories']`, `['todos']` 무효화

### FE-P4-08: 라우터 설정
- **의존성:** FE-P4-05
- **Done When:**
  - [ ] `src/App.tsx`에 `react-router-dom` 라우트 설정:
    - [ ] `/login` → `LoginPage` (공개)
    - [ ] `/signup` → `SignupPage` (공개)
    - [ ] `/todos` → `TodoListPage` (인증 필요)
    - [ ] `/categories` → `CategoryPage` (인증 필요)
    - [ ] `/profile` → `MyProfilePage` (인증 필요)
    - [ ] `*` → `NotFoundPage`
  - [ ] `ProtectedRoute` 컴포넌트: `isLoggedIn` false 시 `/login`으로 리다이렉트

---

## PHASE 5: 프론트엔드 컴포넌트 & 페이지

> **전제:** Phase 4 완료 후 진행

---

### FE-P5-01: 공통 컴포넌트 구현
- **의존성:** FE-P1-05
- **Done When:**
  - [ ] `src/components/common/Button.tsx`: primary/secondary/danger 변형, loading/disabled 상태
  - [ ] `src/components/common/Input.tsx`: 에러 메시지 표시, 접근성 레이블
  - [ ] `src/components/common/Modal.tsx`: 오버레이, Escape 키 닫기, `role="dialog"` aria 속성
  - [ ] `src/components/common/ConfirmDialog.tsx`: 제목/메시지/취소/확인 버튼
  - [ ] `src/components/common/Loading.tsx`: 로딩 스피너/스켈레톤
  - [ ] `src/components/common/ErrorMessage.tsx`: 에러 토스트 또는 인라인 표시
  - [ ] `src/components/common/Header.tsx`: 로고, 사용자 이름, 내비게이션, 로그아웃 버튼
  - [ ] `src/components/common/ProtectedRoute.tsx`: 인증 상태 확인, 미인증 시 리다이렉트

### FE-P5-02: 인증 컴포넌트 구현
- **의존성:** FE-P5-01, FE-P1-07
- **Done When:**
  - [ ] `src/components/auth/LoginForm.tsx`: 이메일/비밀번호 입력, 필드별 유효성 검사, 에러 표시
  - [ ] `src/components/auth/SignupForm.tsx`: 이름/이메일/비밀번호/확인 입력, 비밀번호 일치 확인

### FE-P5-03: Todo 컴포넌트 구현
- **의존성:** FE-P5-01, FE-P1-06, FE-P1-08
- **Done When:**
  - [ ] `src/components/todo/TodoItem.tsx`: 체크박스, 제목(완료 시 취소선), 마감일(기한 초과 시 빨간색), 카테고리 배지, 수정/삭제 버튼
  - [ ] `src/components/todo/TodoList.tsx`: TodoItem 목록, 빈 상태 메시지
  - [ ] `src/components/todo/TodoFormModal.tsx`: 제목/설명/카테고리/마감일 입력 모달 (생성/수정 공용)
  - [ ] `src/components/todo/TodoStatusBadge.tsx`: 완료/기한 초과 배지

### FE-P5-04: Category 컴포넌트 구현
- **의존성:** FE-P5-01
- **Done When:**
  - [ ] `src/components/category/CategoryMenu.tsx`: 기본 카테고리(잠금 아이콘, 삭제 불가), 사용자 카테고리(삭제 버튼)
  - [ ] `src/components/category/CategoryForm.tsx`: 이름 입력 + 추가 버튼

### FE-P5-05: 필터 컴포넌트 구현
- **의존성:** FE-P5-01, FE-P4-01
- **Done When:**
  - [ ] `src/components/filter/FilterBar.tsx`: 카테고리 드롭다운, 날짜 범위 선택, 완료 여부 라디오, 적용/초기화 버튼

### FE-P5-06: 페이지 구현
- **의존성:** FE-P5-01~05, FE-P4-05~07
- **Done When:**
  - [ ] `src/pages/LoginPage.tsx`: LoginForm + useLogin 훅 연결, 성공 시 /todos 이동
  - [ ] `src/pages/SignupPage.tsx`: SignupForm + useRegister 훅 연결, 성공 시 /login 이동
  - [ ] `src/pages/TodoListPage.tsx`:
    - [ ] Header, FilterBar, TodoList, CategoryMenu 조합
    - [ ] "할일 추가" 버튼 → TodoFormModal 열기
    - [ ] 완료 토글, 수정, 삭제 액션 연결
    - [ ] 삭제 전 ConfirmDialog 표시
  - [ ] `src/pages/CategoryPage.tsx`: CategoryForm + CategoryMenu, 삭제 시 할일 재분류 안내 메시지 포함 ConfirmDialog
  - [ ] `src/pages/MyProfilePage.tsx`: 이름/비밀번호 변경 폼 + useUpdateProfile 훅 연결
  - [ ] `src/pages/NotFoundPage.tsx`: 404 메시지 + 홈 링크

### FE-P5-07: 엣지 케이스 UX 처리
- **의존성:** FE-P5-06
- **Done When:**
  - [ ] 페이지 새로고침 시 토큰 초기화 → 로그인 화면으로 이동 (세션 만료 메시지 표시)
  - [ ] 토큰 만료 시 자동 갱신 실패 → 로그인 화면 리다이렉트
  - [ ] 할일 없음 빈 상태: "등록된 할일이 없습니다" 메시지 + "할일 추가" 버튼
  - [ ] 필터 결과 없음: "조건에 맞는 할일이 없습니다" 메시지 + "필터 초기화" 버튼
  - [ ] 기한 초과 할일: 빨간 "기한 초과" 배지 표시
  - [ ] 기본 카테고리 삭제 버튼 비활성화
  - [ ] 네트워크 에러: 에러 메시지 표시

---

## PHASE 6: 통합 테스트 & 검증

> **전제:** Phase 3, Phase 5 완료 후 진행

---

### TEST-01: 백엔드 단위 테스트
- **의존성:** BE-P3-05 ~ BE-P3-08
- **Done When:**
  - [ ] `AuthService` 테스트: 회원가입(중복 이메일 처리), 로그인(비밀번호 검증), 토큰 갱신
  - [ ] `CategoryService` 테스트: 카테고리 조회/생성/삭제(재분류 로직), 기본 카테고리 삭제 금지
  - [ ] `TodoService` 테스트: CRUD, 완료 토글(completedAt), 기한 초과 계산, 필터링

### TEST-02: 백엔드 통합 테스트 (API E2E)
- **의존성:** BE-P3-11, DB-P1-01
- **Done When:**
  - [ ] `POST /auth/register` — 정상 등록, 중복 이메일 409
  - [ ] `POST /auth/login` — 정상 로그인, 잘못된 비밀번호 401
  - [ ] `POST /auth/refresh` — 정상 갱신, 만료 토큰 401
  - [ ] `GET /categories` — 기본+사용자 카테고리 통합 반환
  - [ ] `DELETE /categories/:id` — 할일 재분류 후 삭제, 기본 카테고리 삭제 시 403
  - [ ] `GET /todos` — 필터(카테고리, 날짜, 완료여부) 동작 확인
  - [ ] `PATCH /todos/:id/complete` — isCompleted 토글, completedAt 자동 처리

### TEST-03: 비즈니스 규칙 검증
- **의존성:** TEST-02
- **Done When:**
  - [ ] BR-01: 이메일 중복 등록 시 409 반환
  - [ ] BR-02: 비밀번호 평문 DB 저장 안 됨 확인 (bcrypt 해시 확인)
  - [ ] BR-05: 기본 카테고리(업무/개인/쇼핑) 항상 조회 가능
  - [ ] BR-07: 타인 카테고리 삭제 시 403 반환
  - [ ] BR-08: 카테고리 삭제 시 할일이 '개인' 카테고리로 이동
  - [ ] BR-10: 타인 할일 수정/삭제 시 403 반환
  - [ ] BR-11: 완료 처리 시 completedAt 기록, 취소 시 NULL
  - [ ] BR-12: dueDate < today AND isCompleted=false → overdue 응답 필드 true
  - [ ] BR-13: categoryId/날짜범위/isCompleted 필터 조합 정상 동작

### TEST-04: 프론트엔드 핵심 시나리오 수동 검증
- **의존성:** FE-P5-07, TEST-02
- **Done When:**
  - [ ] SC-01 회원가입: 이메일/비밀번호/이름 입력 → 가입 완료 → 로그인 화면 이동
  - [ ] SC-02 로그인: 이메일/비밀번호 입력 → 토큰 Zustand 메모리 저장 → 할일 목록 이동
  - [ ] SC-03 로그아웃: 로그아웃 버튼 → 메모리 토큰 삭제 → 로그인 화면 이동
  - [ ] SC-04 페이지 새로고침: 로그인 화면으로 이동 (토큰 초기화 확인)
  - [ ] SC-05 할일 생성: 제목/카테고리 선택 → 저장 → 목록에 표시
  - [ ] SC-06 할일 완료: 체크박스 클릭 → 취소선 표시, completedAt 기록
  - [ ] SC-07 할일 필터: 카테고리/날짜/완료 여부 필터 → 결과 정상 반영
  - [ ] SC-08 카테고리 삭제: 삭제 확인 다이얼로그 → 할일 '개인'으로 재분류 확인
  - [ ] SC-09 기한 초과 표시: dueDate 지난 미완료 할일 → '기한 초과' 배지 표시
  - [ ] SC-10 반응형: 모바일(375px) / 태블릿(768px) / 데스크탑(1280px) 레이아웃 정상 확인

---

## 의존성 요약 (Critical Path)

```
[DB-P1-01] DB 스키마 적용
    ↓
[BE-P1-01 ~ BE-P1-05] 백엔드 프로젝트 초기 설정
    ↓
[BE-P2-01] DB 연결 풀
    ↓
[BE-P2-02 ~ BE-P2-04] Repository 구현
    ↓
[BE-P3-01 ~ BE-P3-04] 유틸리티 & 미들웨어
    ↓
[BE-P3-05 ~ BE-P3-08] Service 구현
    ↓
[BE-P3-09 ~ BE-P3-11] Controller & Router & 서버 진입점
    ↓
[TEST-01 ~ TEST-03] 백엔드 테스트

[FE-P1-01 ~ FE-P1-08] 프론트엔드 초기 설정  ← 병렬 진행 가능
    ↓
[FE-P4-01 ~ FE-P4-08] 인프라 (Zustand, Axios, Hooks, Router)
    ↓
[FE-P5-01 ~ FE-P5-07] 컴포넌트 & 페이지
    ↓
[TEST-04] 통합 수동 검증
```

---

## 작업 수 요약

| Phase | 영역 | Task 수 |
|---|---|---|
| Phase 1 | DB 환경 설정 | 1 |
| Phase 1 | 백엔드 환경 설정 | 5 |
| Phase 1 | 프론트엔드 환경 설정 | 8 |
| Phase 2 | DB 연결 & 레포지토리 | 4 |
| Phase 3 | 백엔드 서비스 & API | 11 |
| Phase 4 | 프론트엔드 인프라 | 8 |
| Phase 5 | 프론트엔드 UI | 7 |
| Phase 6 | 테스트 & 검증 | 4 |
| **합계** | | **48** |
