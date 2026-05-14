# TodoListApp 프로젝트 구조 설계 원칙

**버전:** 1.0.0  
**작성일:** 2026-05-13  
**상태:** 초안  
**참조 문서:**
- `docs/1-domain-definition.md` — TodoListApp 도메인 정의서 v1.0.0
- `docs/2-prd.md` — TodoListApp PRD v1.0.0
- `docs/3-user-scenario.md` — TodoListApp 사용자 시나리오 v1.0.0

---

## 목차

1. [공통 최상위 원칙](#1-공통-최상위-원칙)
2. [의존성/레이어 원칙](#2-의존성레이어-원칙)
3. [코드/네이밍 원칙](#3-코드네이밍-원칙)
4. [테스트/품질 원칙](#4-테스트품질-원칙)
5. [설정/보안/운영 원칙](#5-설정보안운영-원칙)
6. [프론트엔드 디렉토리 구조](#6-프론트엔드-디렉토리-구조)
7. [백엔드 디렉토리 구조](#7-백엔드-디렉토리-구조)

---

## 1. 공통 최상위 원칙

### P-COM-01: 단방향 의존성 원칙

**선언:** 레이어 간 의존성은 상위 계층에서 하위 계층으로만 흘러야 한다. 역방향 의존성 절대 금지.

**구조:**
```
UI → Application → Domain → Infrastructure
```

백엔드 구체적 계층:
```
Router → Controller → Service → Repository → Database
```

프론트엔드 구체적 계층:
```
Page → Component → Hook (TanStack Query) → API Client
```

**설명:** 하위 계층은 상위 계층을 몰라야 한다. 예를 들어 Repository는 Service를 참조하지 않으며, API Client는 특정 Page를 의식하지 않는다.

---

### P-COM-02: 관심사 분리(SoC) 원칙

**선언:** 각 파일과 함수는 단 하나의 책임만 가져야 한다. 비즈니스 로직, 데이터 접근, 통신, UI 렌더링을 철저히 분리한다.

**적용 예시:**
- **Service**: 비즈니스 로직만 (할일 생성 시 카테고리 유효성, 중복 처리 등)
- **Repository**: DB 쿼리 실행만 (pg 드라이버 직접 사용)
- **Controller**: 요청/응답 처리만 (유효성 검증 위임, 직렬화/역직렬화)
- **Component**: UI 렌더링만 (비즈니스 로직 포함 금지)
- **Hook**: 데이터 페칭과 상태 관리만 (UI 로직 분리)

---

### P-COM-03: 단일 책임 원칙(SRP) 적용 방법

**선언:** 모든 클래스, 함수, 모듈은 변경의 이유가 최소 1개여야 한다.

**백엔드 적용:**
- `UserService`: 사용자 가입·로그인·정보 수정만 담당. 이메일 발송, 외부 API 연동은 별도 서비스로 분리.
- `TodoService`: 할일 CRUD와 필터 로직만 담당. 카테고리 관리는 `CategoryService`.
- `TodoRepository`: 할일 관련 DB 쿼리만 실행. 조인, 트랜잭션 등 DB 접근 로직만 포함.

**프론트엔드 적용:**
- `TodoList` 컴포넌트: 할일 리스트 렌더링만. 필터 로직은 커스텀 훅에 위임.
- `useTodoList` 훅: TanStack Query 쿼리와 필터 상태 관리만. UI 렌더링 로직 없음.
- `todoApi` 함수: API 호출만. 비즈니스 로직 없음.

---

### P-COM-04: 도메인 언어(Ubiquitous Language) 일치 원칙

**선언:** 도메인 정의서에 명시된 용어(User, Todo, Category, dueDate, isCompleted, completedAt 등)를 코드 식별자에 그대로 사용한다. 약자나 임의 변형 금지.

**예시:**
- ✅ `userId`, `todoId`, `categoryId`, `dueDate`, `isCompleted`, `completedAt`
- ❌ `uid`, `tid`, `cid`, `deadline`, `done`, `finishedAt`

**장점:**
- 도메인 전문가와의 소통 정확도 증가
- 코드 리뷰 시 도메인 검증 용이
- 자체 문서화 효과

---

## 2. 의존성/레이어 원칙

### P-BE-01: 백엔드 5계층 아키텍처

**선언:** 백엔드는 다음 5개 레이어를 순서대로 적용하며, 각 레이어는 아래 레이어에만 의존한다.

| 레이어 | 책임 | 의존 대상 |
|---|---|---|
| Router | HTTP 라우팅, 엔드포인트 정의 | Controller |
| Controller | 요청 파싱, 응답 직렬화, 상태 코드 결정 | Service |
| Service | 비즈니스 로직, 유효성 검증, 도메인 규칙 | Repository |
| Repository | DB 쿼리 실행, 데이터 매핑 | Database (pg 드라이버) |
| Database | PostgreSQL 연결, 풀 관리 | — |

**구체 규칙:**
- Router는 Controller 메서드만 호출. 비즈니스 로직 없음.
- Controller는 Service 메서드만 호출. DB 접근 직접 금지.
- Service는 Repository 메서드만 호출. Express 객체(req, res) 사용 금지.
- Repository는 pg 라이브러리만 사용. 다른 라이브러리 금지. ORM 절대 금지.

---

### P-BE-02: 프론트엔드 4계층 아키텍처

**선언:** 프론트엔드는 다음 4개 레이어를 순서대로 적용하며, 각 레이어는 아래 레이어에만 의존한다.

| 레이어 | 책임 | 의존 대상 |
|---|---|---|
| Page | 라우트별 페이지 컴포넌트, 전체 레이아웃 조정 | Component, Hook |
| Component | UI 렌더링, 사용자 인터랙션 처리 | Component(하위), Hook, Utils |
| Hook | TanStack Query 쿼리, 커스텀 상태 관리 | API Client, Store(Zustand) |
| API Client | HTTP 요청/응답 처리 | — |

**구체 규칙:**
- Page는 Component와 Hook을 조합하여 화면 구성. 비즈니스 로직 금지.
- Component는 UI 렌더링과 이벤트 핸들러만 포함. 직접 API 호출 금지.
- Hook은 TanStack Query로 서버 상태 관리. UI 렌더링 로직 없음.
- API Client는 HTTP 통신만 담당. 비즈니스 로직이나 UI 상태 관리 금지.

---

### P-BE-03: 순환 의존성 금지

**선언:** 어떤 모듈도 직접 또는 간접적으로 자신을 참조하는 구조는 절대 허용하지 않는다.

**금지 패턴:**
```
A → B → C → A  (순환)
Service A → Service B → Service A  (순환)
```

**검증 방법:**
- 모듈 import 그래프를 정기적으로 시각화
- PR 리뷰 시 새 의존성 추가 확인
- 모듈 import 경로 시각화 도구(madge 등) 사용

---

### P-BE-04: Repository는 pg 직접 사용 원칙

**선언:** Repository 계층은 반드시 `pg` (node-postgres) 라이브러리를 직접 사용하며, ORM(TypeORM, Sequelize, Prisma 등) 사용을 절대 금지한다.

**이유:**
- 도메인 정의서의 snake_case DB 컬럼을 camelCase 자바스크립트 객체로 명시적으로 매핑
- SQL 쿼리의 완전한 제어 및 성능 최적화 가능
- pg 파라미터 바인딩($1, $2 등)으로 SQL Injection 원천 차단

**필수 구현:**
```javascript
// 예: user-repository.js
const query = 'SELECT user_id, email, name FROM users WHERE email = $1';
const result = await pool.query(query, [email]);
// snake_case DB 결과를 camelCase로 매핑
return {
  userId: result.rows[0].user_id,
  email: result.rows[0].email,
  name: result.rows[0].name,
};
```

---

### P-BE-05: Controller는 Service 호출 전담

**선언:** Controller는 Service 메서드 호출만 수행하며, 직접 Repository나 Database 접근 금지.

**Controller 역할:**
- HTTP 요청 파싱 및 유효성 검증 (기본 타입, 필드 존재 확인)
- Service 메서드 호출
- 응답 직렬화 및 상태 코드 결정
- 에러 처리 및 에러 응답 변환

**금지 사항:**
- 복잡한 비즈니스 로직 구현
- 직접 쿼리 실행
- 데이터베이스 트랜잭션 관리

---

### P-FE-01: 컴포넌트는 UI 렌더링만 담당

**선언:** React 컴포넌트는 Props를 받아 UI를 렌더링하고 이벤트 핸들러만 정의한다. API 호출, 복잡한 상태 로직은 커스텀 훅으로 분리.

**예시:**
```typescript
// ✅ 올바른 예
const TodoListComponent: React.FC<{ todos: Todo[]; onComplete: (id: string) => void }> = ({
  todos,
  onComplete,
}) => (
  <ul>
    {todos.map((todo) => (
      <li key={todo.todoId}>
        {todo.title}
        <button onClick={() => onComplete(todo.todoId)}>Complete</button>
      </li>
    ))}
  </ul>
);

// ❌ 금지된 예
const TodoListBad: React.FC = () => {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    // API 호출을 컴포넌트에서 직접 수행
    fetch('/api/todos')
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);
  return <div>{/* ... */}</div>;
};
```

---

### P-FE-02: Hook은 TanStack Query 기반 상태 관리

**선언:** 커스텀 훅은 TanStack Query를 사용하여 서버 상태(Todo 목록 등)와 Zustand를 사용하여 클라이언트 상태(필터, UI 토글 등)를 관리한다.

**TanStack Query (서버 상태):**
- 할일 목록 조회
- 카테고리 목록 조회
- 할일 추가/수정/삭제 변경(Mutation)

**Zustand (클라이언트 상태):**
- **로그인 토큰 (in-memory)** — Access Token, Refresh Token을 Zustand 메모리에만 저장. localStorage / sessionStorage / Cookie 저장 금지
- 필터 값(카테고리, 날짜 범위, 완료 여부)
- UI 토글(모달 표시/숨김)

---

### P-FE-03: CSS Custom Properties 기반 테마 구조 준비

**선언:** 다크 모드는 1차 범위에서 제외하지만, `index.css`에 CSS Custom Properties(변수) 기반 테마 구조를 1차 구현 시점부터 준비한다. 컴포넌트에 색상·간격 값을 하드코딩하지 않는다.

**이유:** 2차에서 다크 모드 추가 시 CSS 변수 값만 교체하면 전체 테마가 전환되도록 구조를 미리 갖춘다. 하드코딩된 경우 다크 모드 적용에 전수 수정이 필요해진다.

**구현 방식:**
```css
/* index.css — 1차: 라이트 모드 변수만 정의 */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text-primary: #111827;
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

/* 2차 확장 시 추가 예정 */
/* [data-theme="dark"] { --color-bg-primary: #111827; ... } */
```

**컴포넌트 사용 원칙:**
```css
/* ✅ 올바른 예 — CSS 변수 참조 */
.todo-item {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

/* ❌ 금지 — 색상 하드코딩 */
.todo-item {
  background-color: #f9fafb;
  color: #111827;
}
```

**다국어(i18n) 대비:** UI에 노출되는 모든 문자열은 `constants/messages.ts`에 상수로 정의하며 컴포넌트 내 직접 하드코딩을 금지한다. 2차 다국어 확장 시 메시지 파일만 교체하면 된다.

```typescript
// constants/messages.ts
export const MESSAGES = {
  TODO: {
    EMPTY: '할일이 없습니다.',
    DELETE_CONFIRM: '이 할일을 삭제하시겠습니까?',
    COMPLETE_SUCCESS: '할일이 완료 처리되었습니다.',
  },
  AUTH: {
    LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
    EMAIL_DUPLICATE: '이미 사용 중인 이메일입니다.',
  },
  CATEGORY: {
    DELETE_CONFIRM: (count: number) =>
      `해당 카테고리의 할일 ${count}건이 '개인' 카테고리로 이동됩니다. 삭제하시겠습니까?`,
  },
};
```

---

## 3. 코드/네이밍 원칙

### P-NAM-01: 파일 네이밍 컨벤션

**백엔드 (kebab-case, `.js`):**
```
user-controller.js
user-service.js
user-repository.js
auth-middleware.js
jwt-utils.js
```

**프론트엔드:**
- 컴포넌트: PascalCase (파일명, 함수명 동일)
  ```
  TodoList.tsx
  TodoItem.tsx
  CategoryMenu.tsx
  ```
- 훅: camelCase + `use` 접두사
  ```
  useTodoList.ts
  useCategories.ts
  useAuthToken.ts
  ```
- 유틸리티: camelCase
  ```
  dateUtils.ts
  parseResponse.ts
  apiClient.ts
  ```

---

### P-NAM-02: 변수/함수 네이밍

**Camel Case 원칙:**
```javascript
// 함수
function getUserById(userId) { }
function createTodo(title, categoryId) { }

// 변수
const userId = 'abc123';
const todoList = [];
const maxRetries = 3;
```

**Boolean 변수: is/has 접두사 필수**
```javascript
const isCompleted = true;
const hasError = false;
const isLoading = true;
const hasAuthToken = false;
```

**이벤트 핸들러: handle 접두사 (프론트엔드)**
```typescript
const handleTodoDelete = (todoId: string) => { };
const handleFilterChange = (newFilter: Filter) => { };
const handleSubmit = (e: React.FormEvent) => { };
```

**Promise/Async 함수: 명사로 시작**
```javascript
// ✅ 올바른 예
const fetchUserData = async () => { };
const saveTodo = async (todo) => { };

// ❌ 금지된 예
const loadUserData = async () => { }; // "fetch" 또는 "get" 사용
const writeTodo = async (todo) => { }; // "save" 또는 "create" 사용
```

---

### P-NAM-03: DB 컬럼명 ↔ JS 객체 변환

**선언:** 데이터베이스는 snake_case 컬럼명을 사용하고, JavaScript는 camelCase 속성명을 사용한다. 변환은 **Repository 레이어에서만** 수행한다.

**변환 위치:**

```javascript
// ✅ repository에서만 변환
const getUserById = async (userId) => {
  const query = 'SELECT user_id, email, name, created_at FROM users WHERE user_id = $1';
  const result = await pool.query(query, [userId]);

  // snake_case → camelCase 변환 (여기서만!)
  return {
    userId: result.rows[0].user_id,
    email: result.rows[0].email,
    name: result.rows[0].name,
    createdAt: result.rows[0].created_at,
  };
};

// ❌ Service, Controller에서 변환 금지
const getUserService = async (userId) => {
  const user = await userRepository.getUserById(userId);
  // user는 이미 camelCase여야 함
  return user;
};
```

**DB 스키마 (snake_case):**
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE todos (
  todo_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### P-NAM-04: REST API URL 네이밍

**선언:** 모든 REST API 엔드포인트는 kebab-case 복수형 명사를 사용하며, 프리픽스 `/api`를 포함한다.

**형식:**
```
/api/[resource-name]
/api/[resource-name]/:resourceId
/api/[resource-name]/:resourceId/[sub-resource]
```

**구체 예시:**
```
POST   /api/auth/register          # 회원가입
POST   /api/auth/login             # 로그인
POST   /api/auth/refresh           # 토큰 재발급
PATCH  /api/users/me               # 개인정보 수정

GET    /api/categories             # 카테고리 목록 조회
POST   /api/categories             # 카테고리 생성
DELETE /api/categories/:categoryId # 카테고리 삭제

GET    /api/todos                  # 할일 목록 조회 (필터 쿼리: ?categoryId=...&dueDate=...&isCompleted=...)
POST   /api/todos                  # 할일 생성
PATCH  /api/todos/:todoId          # 할일 수정
DELETE /api/todos/:todoId          # 할일 삭제
PATCH  /api/todos/:todoId/complete # 할일 완료 상태 토글
```

**금지 패턴:**
```
❌ /api/todo (단수형)
❌ /api/getTodos (동사)
❌ /api/todos/update/:todoId (동사)
❌ /api/categories/123 (숫자 ID 대신 UUID 사용)
```

---

### P-NAM-05: 상수 네이밍

**선언:** 모든 상수는 UPPER_SNAKE_CASE를 사용한다.

**백엔드 예시:**
```javascript
// constants/auth.js
const JWT_ACCESS_TOKEN_EXPIRY = '1h';
const JWT_REFRESH_TOKEN_EXPIRY = '7d';
const PASSWORD_MIN_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// constants/defaults.js
const DEFAULT_CATEGORY_NAMES = ['업무', '개인', '쇼핑'];
const DEFAULT_PERSONAL_CATEGORY = '개인';
const MAX_CATEGORY_NAME_LENGTH = 100;
const MAX_TODO_TITLE_LENGTH = 255;

module.exports = { JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY, PASSWORD_MIN_LENGTH, EMAIL_REGEX };
```

**프론트엔드 예시:**
```typescript
// constants/api.ts
export const API_BASE_URL = 'https://api.example.com/api';
export const REQUEST_TIMEOUT_MS = 30000;

// constants/filter.ts
export const FILTER_STATUS_ALL = 'all';
export const FILTER_STATUS_COMPLETED = 'completed';
export const FILTER_STATUS_INCOMPLETE = 'incomplete';

// constants/dates.ts
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm:ss';
```

---

### P-NAM-06: 프론트엔드 TypeScript 타입 네이밍

> **적용 범위:** 프론트엔드(React + TypeScript)에만 적용. 백엔드는 JavaScript를 사용하므로 타입 선언 불필요.

**선언:** 타입과 인터페이스는 PascalCase를 사용하며, I 접두사(Hungarian notation) 절대 금지. 도메인 정의서의 엔티티명을 그대로 사용.

**올바른 예 (프론트엔드):**
```typescript
// User 엔티티 타입
interface User {
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Todo 엔티티 타입
type Todo = {
  todoId: string;
  userId: string;
  categoryId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// 열거형
enum CompletionStatus {
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete',
  ALL = 'all',
}
```

**금지된 예:**
```typescript
// ❌ I 접두사 사용 금지
interface IUser { }
interface ITodo { }

// ❌ 도메인 용어와 무관한 이름
interface UserDTO { } // 대신 User 사용
interface TodoEntity { } // 대신 Todo 사용
```

---

## 4. 테스트/품질 원칙

### P-TEST-01: 테스트 범위 정의

**선언:** 테스트는 두 가지 범위로 나뉜다:

1. **단위 테스트 (Unit Test):** Service 레이어
   - 각 Service 메서드의 비즈니스 로직 검증
   - 입력값 유효성 검증
   - 도메인 규칙 적용 확인

2. **통합 테스트 (Integration Test):** API E2E
   - 전체 요청-응답 흐름 검증
   - Repository와 실제 DB(테스트 DB) 또는 pg mock 사용
   - 라우팅, 미들웨어, 인증 포함

**테스트 작성 우선순위:**
```
높음: Service 레이어 (비즈니스 로직)
중간: Repository (DB 쿼리, pg mock 사용)
낮음: Component UI (스냅샷 테스트 정도)
```

---

### P-TEST-02: 테스트 파일 위치

**선언:** 테스트 파일은 테스트 대상 파일과 동일 디렉토리에 위치한다. 백엔드는 `.test.js`, 프론트엔드는 `.test.ts` 확장자를 사용한다.

**백엔드 구조 (JavaScript):**
```
src/
  services/
    user-service.js
    user-service.test.js
    todo-service.js
    todo-service.test.js
  repositories/
    user-repository.js
    user-repository.test.js
  __tests__/
    integration/
      auth-api.test.js
      todo-api.test.js
```

**프론트엔드 구조:**
```
src/
  hooks/
    useTodoList.ts
    useTodoList.test.ts
  components/
    TodoList.tsx
    TodoList.test.tsx
  utils/
    dateUtils.ts
    dateUtils.test.ts
```

---

### P-TEST-03: Repository 테스트 원칙

**선언:** Repository 테스트는 **실제 테스트 데이터베이스** 또는 **pg 라이브러리의 모의 객체(mock)**를 사용한다. ORM 모의 객체 금지.

**권장 방식 (테스트 DB):**
```typescript
// user-repository.test.ts
import { Pool } from 'pg';

describe('UserRepository', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
    });
  });

  afterEach(async () => {
    // 테스트 후 데이터 정리
    await pool.query('DELETE FROM users');
  });

  afterAll(() => {
    pool.end();
  });

  test('should create user successfully', async () => {
    const user = await userRepository.createUser('test@example.com', 'hashedPassword', 'Test User');
    expect(user.email).toBe('test@example.com');
  });
});
```

**pg mock 사용 예:**
```typescript
// 대체 방식 (mocha/sinon 사용)
import sinon from 'sinon';
import { Pool } from 'pg';

describe('UserRepository with mock', () => {
  let pool: sinon.SinonStubbedInstance<Pool>;

  beforeEach(() => {
    pool = sinon.createStubInstance(Pool);
  });

  test('should parse query result correctly', async () => {
    pool.query.resolves({
      rows: [{ user_id: '123', email: 'test@example.com', name: 'Test' }],
    });
    // ...
  });
});
```

---

### P-TEST-04: 커버리지 목표

**선언:** 테스트 커버리지 목표는 Service 레이어 기준 **최소 80%**이며, CI/CD 파이프라인에서 강제한다.

**계층별 목표:**
- Service: 80% 이상
- Repository: 70% 이상 (DB 의존성으로 인한 완화)
- Controller: 50% 이상 (주로 통합 테스트로 커버)
- Component: 30% 이상 (UI 테스트는 부담 큼)

**CI 설정:**
```yaml
# GitHub Actions 예
- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage threshold
  run: npm run coverage:check -- --threshold=80
```

---

### P-TEST-05: ESLint + Prettier 설정

**선언:** 코드 품질 자동화를 위해 ESLint와 Prettier를 필수 적용한다.

**ESLint 규칙 (백엔드):**
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],
    "no-circular-dependency-import": "error"
  }
}
```

**ESLint 규칙 (프론트엔드):**
```json
{
  "extends": [
    "react-app",
    "react-app/jest",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": "warn"
  }
}
```

**Prettier 설정:**
```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "arrowParens": "always"
}
```

**Pre-commit Hook (husky):**
```bash
#!/bin/sh
npm run lint
npm run format
npm run test -- --passWithNoTests
```

---

## 5. 설정/보안/운영 원칙

### P-CONFIG-01: 환경변수 관리

**선언:** 모든 환경 의존 설정은 환경변수로 관리하며, `.env` 파일은 절대 Git 커밋하지 않는다. `.env.example` 파일을 제공하여 필요한 변수를 명시한다.

**.env.example (커밋):**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_dev
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api
```

**.gitignore:**
```
.env
.env.local
.env.*.local
```

**환경변수 로드 (백엔드):**
```typescript
// src/config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
};

// 필수 환경변수 검증
const requiredVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const variable of requiredVars) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}
```

---

### P-CONFIG-02: 필수 환경변수 목록

**선언:** 다음 환경변수는 모든 환경(개발, 테스트, 운영)에서 필수다. 누락 시 애플리케이션 시작 불가.

| 변수 | 설명 | 예시 | 최소 길이 |
|---|---|---|---|
| DB_HOST | PostgreSQL 서버 호스트 | localhost | — |
| DB_PORT | PostgreSQL 포트 | 5432 | — |
| DB_NAME | 데이터베이스명 | todolist_dev | — |
| DB_USER | DB 사용자명 | postgres | — |
| DB_PASSWORD | DB 비밀번호 | password123 | 6자 이상 |
| JWT_SECRET | Access Token 시크릿 | secret-key-123... | 32자 이상 |
| JWT_REFRESH_SECRET | Refresh Token 시크릿 | refresh-secret-123... | 32자 이상 |
| PORT | 서버 포트 | 3000 | — |
| NODE_ENV | 실행 환경 | development, test, production | — |
| CORS_ORIGIN | CORS 허용 Origin | http://localhost:3000,... | — |

**시크릿 생성 도구:**
```bash
# OpenSSL
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### P-CONFIG-03: JWT 시크릿 관리

**선언:** JWT 시크릿(JWT_SECRET, JWT_REFRESH_SECRET)은 환경변수로만 관리하며, 최소 32자 이상의 복잡한 문자열이어야 한다.

**JWT 발급:**
```typescript
// src/utils/jwt-utils.ts
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: '1h' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.secret) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
};
```

**미들웨어 적용:**
```typescript
// src/middlewares/auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt-utils';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' },
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Token verification failed' },
    });
  }
};
```

---

### P-CONFIG-04: SQL Injection 방지

**선언:** 모든 SQL 쿼리는 pg 라이브러리의 파라미터 바인딩($1, $2 등)을 필수 사용한다. 문자열 직접 조합 절대 금지.

**올바른 방식 (파라미터 바인딩):**
```typescript
// ✅ 안전함
const query = 'SELECT * FROM todos WHERE user_id = $1 AND category_id = $2';
const result = await pool.query(query, [userId, categoryId]);

// ✅ 안전함 (여러 파라미터)
const insertQuery = `
  INSERT INTO todos (todo_id, user_id, category_id, title, due_date, created_at)
  VALUES ($1, $2, $3, $4, $5, $6)
`;
await pool.query(insertQuery, [
  todoId,
  userId,
  categoryId,
  title,
  dueDate,
  new Date(),
]);
```

**금지된 방식 (직접 조합):**
```typescript
// ❌ SQL Injection 취약점
const query = `SELECT * FROM todos WHERE user_id = '${userId}' AND category_id = '${categoryId}'`;
await pool.query(query);

// ❌ 문자열 템플릿 사용
const userId = req.params.userId;
const query = `DELETE FROM todos WHERE user_id = ${userId}`;
```

**동적 쿼리 필요 시 안전 패턴:**
```typescript
// 복잡한 필터 조건
const buildTodoQuery = (filters: {
  userId: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  isCompleted?: boolean;
}) => {
  const conditions: string[] = ['user_id = $1'];
  const values: unknown[] = [filters.userId];
  let paramIndex = 2;

  if (filters.categoryId) {
    conditions.push(`category_id = $${paramIndex}`);
    values.push(filters.categoryId);
    paramIndex++;
  }

  if (filters.startDate) {
    conditions.push(`due_date >= $${paramIndex}`);
    values.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`due_date <= $${paramIndex}`);
    values.push(filters.endDate);
    paramIndex++;
  }

  if (filters.isCompleted !== undefined) {
    conditions.push(`is_completed = $${paramIndex}`);
    values.push(filters.isCompleted);
    paramIndex++;
  }

  const query = `SELECT * FROM todos WHERE ${conditions.join(' AND ')}`;
  return { query, values };
};

// 사용
const { query, values } = buildTodoQuery({
  userId: 'user-123',
  categoryId: 'cat-456',
  isCompleted: false,
});
const result = await pool.query(query, values);
```

---

### P-CONFIG-05: CORS 설정

**선언:** CORS는 명시적으로 허용할 Origin을 환경변수로 지정하며, 와일드카드(`*`) 사용은 개발 환경에서만 허용한다.

**Express CORS 설정:**
```typescript
// src/app.ts
import cors from 'cors';
import { config } from './config';

const corsOptions = {
  origin: config.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

**환경별 설정:**
```bash
# 개발 (localhost)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# 운영
CORS_ORIGIN=https://app.example.com,https://www.example.com
```

---

### P-CONFIG-06: 민감 정보 로그 출력 금지

**선언:** 비밀번호, JWT 토큰, API 키 등 민감 정보를 로그에 출력하지 않는다.

**금지 패턴:**
```typescript
// ❌ 금지
console.log('User login:', { email, password }); // 비밀번호 노출
console.log('Token:', accessToken); // 토큰 노출
res.send({ user, token }); // 응답에 비밀번호 포함

// ✅ 안전한 방식
console.log('User login attempt:', { email }); // 이메일만
console.log('Token generated'); // 토큰 자체 로그 안 함
const { password, ...userWithoutPassword } = user;
res.send({ user: userWithoutPassword, token });
```

**로깅 유틸:**
```typescript
// src/utils/logger.ts
export const sanitizeObject = (obj: any, sensitiveKeys: string[] = []): any => {
  const defaultSensitiveKeys = ['password', 'token', 'secret', 'refreshToken'];
  const keysToRedact = [...defaultSensitiveKeys, ...sensitiveKeys];

  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (keysToRedact.includes(key)) {
        return '[REDACTED]';
      }
      return value;
    })
  );
};

export const logRequest = (req: Request, message: string) => {
  const { email, userId } = req.body || {};
  console.log(`[${message}] Email: ${email}, User: ${userId}`);
  // 비밀번호는 절대 로그하지 않음
};
```

---

### P-CONFIG-07: 에러 응답 구조 표준화

**선언:** 모든 에러 응답은 일관된 JSON 구조를 사용한다.

**표준 에러 응답 포맷:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

**백엔드 구현:**
```typescript
// src/types/error.ts
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

// src/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (err: unknown, res: Response) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // 예상치 못한 에러
  console.error('Unexpected error:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};

// src/app.ts (Express 에러 핸들러)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res);
});
```

**에러 코드 정의:**
```typescript
// src/constants/error-codes.ts
export const ERROR_CODES = {
  // Auth
  UNAUTHORIZED: { code: 'UNAUTHORIZED', statusCode: 401 },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', statusCode: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', statusCode: 403 },
  
  // Validation
  INVALID_INPUT: { code: 'INVALID_INPUT', statusCode: 400 },
  DUPLICATE_EMAIL: { code: 'DUPLICATE_EMAIL', statusCode: 409 },
  
  // Resource
  NOT_FOUND: { code: 'NOT_FOUND', statusCode: 404 },
  
  // Server
  INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', statusCode: 500 },
};
```

**Controller에서 사용:**
```typescript
// src/controllers/user-controller.ts
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError(
        ERROR_CODES.INVALID_INPUT.code,
        'Email, password, and name are required',
        ERROR_CODES.INVALID_INPUT.statusCode
      );
    }

    const user = await userService.createUser(email, password, name);
    res.status(201).json({ user });
  } catch (err) {
    handleError(err, res);
  }
};
```

---

## 6. 프론트엔드 디렉토리 구조

### 프론트엔드 디렉토리 구조 및 역할

```
frontend/
  src/
    api/                      # axios 인스턴스, API 함수 (HTTP 통신 레이어)
      client.ts              # axios 인스턴스 설정, 기본 헤더/인터셉터
      auth-api.ts            # POST /auth/register, POST /auth/login, POST /auth/refresh
      category-api.ts        # GET /categories, POST /categories, DELETE /categories/:id
      todo-api.ts            # GET /todos, POST /todos, PATCH /todos/:id, DELETE, /complete
      types.ts               # API 요청/응답 타입 (CreateTodoRequest, TodoResponse 등)
    
    components/               # 공통 재사용 UI 컴포넌트 (프리젠테이션만)
      common/
        Header.tsx           # 상단 네비게이션, 사용자 정보 표시
        Footer.tsx           # 푸터
        Button.tsx           # 공통 버튼 컴포넌트
        Input.tsx            # 공통 입력 필드
        Modal.tsx            # 공통 모달 다이얼로그
      auth/
        LoginForm.tsx        # 로그인 폼 UI
        SignupForm.tsx       # 회원가입 폼 UI
      todo/
        TodoList.tsx         # 할일 리스트 렌더링 (Props로 todos[] 받음)
        TodoItem.tsx         # 할일 항목 렌더링 및 상호작용
        TodoFormModal.tsx    # 할일 등록/수정 폼
      category/
        CategoryMenu.tsx     # 카테고리 목록 렌더링
        CategoryForm.tsx     # 카테고리 추가 폼
      filter/
        FilterBar.tsx        # 필터 UI (카테고리, 날짜, 완료 여부)
    
    hooks/                    # TanStack Query + 커스텀 훅 (데이터 관리)
      auth/
        useLogin.ts          # 로그인 Mutation (useMutation)
        useRegister.ts       # 회원가입 Mutation
        useRefreshToken.ts   # 토큰 재발급 Mutation
        useUpdateProfile.ts  # 개인정보 수정 Mutation
      todo/
        useTodoList.ts       # 할일 목록 쿼리 (useQuery) + 필터 상태
        useCreateTodo.ts     # 할일 생성 Mutation
        useUpdateTodo.ts     # 할일 수정 Mutation
        useDeleteTodo.ts     # 할일 삭제 Mutation
        useCompleteTodo.ts   # 할일 완료 토글 Mutation
      category/
        useCategories.ts     # 카테고리 목록 쿼리
        useCreateCategory.ts # 카테고리 생성 Mutation
        useDeleteCategory.ts # 카테고리 삭제 Mutation
      useAuth.ts            # 인증 상태 확인 (토큰 검증)
    
    pages/                    # 라우트별 페이지 (화면 조합)
      LoginPage.tsx          # 로그인 화면 (LoginForm + 비로그인 상태)
      SignupPage.tsx         # 회원가입 화면
      TodoListPage.tsx       # 할일 목록 화면 (TodoList + FilterBar + 할일 추가 버튼)
      TodoDetailPage.tsx     # 할일 상세 보기 및 수정 화면 (있는 경우)
      CategoryPage.tsx       # 카테고리 관리 화면 (CategoryMenu + 추가/삭제)
      MyProfilePage.tsx      # 마이페이지 (개인정보 수정)
      NotFoundPage.tsx       # 404 페이지
    
    stores/                   # Zustand 스토어 (클라이언트 상태, in-memory)
      auth-store.ts         # accessToken, refreshToken, userId, isLoggedIn — 메모리 전용, 영속화 금지
      filter-store.ts       # 필터값 (categoryId, startDate, endDate, isCompleted)
      ui-store.ts           # UI 토글 (모달 표시/숨김, 사이드바 열림 등)
    
    types/                    # TypeScript 타입 정의 (공통)
      index.ts              # 모든 타입 export
      user.ts               # User, LoginRequest, LoginResponse
      todo.ts               # Todo, CreateTodoRequest, UpdateTodoRequest
      category.ts           # Category, CreateCategoryRequest
      filter.ts             # Filter, FilterStatus
    
    utils/                    # 순수 유틸리티 함수
      date-utils.ts         # formatDate, parseDateString, getToday
      validate.ts           # validateEmail, validatePassword, validateTodoTitle
      storage.ts            # 비토큰 데이터(UI 설정 등) 위한 localStorage 유틸. 토큰은 저장 금지
      parse-response.ts     # API 응답 snake_case → camelCase 변환 (필요 시)
    
    constants/                # 상수
      api.ts                # API_BASE_URL, REQUEST_TIMEOUT_MS
      filter.ts             # FILTER_STATUS_ALL, FILTER_STATUS_COMPLETED 등
      messages.ts           # 공통 메시지 (에러, 성공, 안내)
      validation.ts         # 정규식, 최소/최대 길이 등
    
    App.tsx                  # 루트 컴포넌트, 라우팅 정의
    main.tsx                 # 엔트리포인트 (React.StrictMode, QueryClientProvider 등)
    index.css               # 글로벌 스타일

  public/
    index.html
    favicon.ico
  
  vite.config.ts           # Vite 설정
  tsconfig.json            # TypeScript 설정
  .env.example
  package.json
```

### 주요 파일별 역할 설명

#### stores/auth-store.ts
```typescript
// Access Token, Refresh Token을 Zustand 메모리(in-memory)에만 저장
// persist 미들웨어 사용 금지 — localStorage/Cookie 영속화 절대 금지
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isLoggedIn: boolean;
  setTokens: (accessToken: string, refreshToken: string, userId: string) => void;
  clearTokens: () => void;
}

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

#### api/client.ts
```typescript
// axios 인터셉터에서 Zustand 메모리의 토큰을 헤더에 주입
import axios from 'axios';
import { useAuthStore } from '../stores/auth-store';

export const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// 요청 인터셉터: 메모리에서 토큰 읽어 헤더 주입
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 응답 인터셉터: 401 시 Refresh Token으로 재발급 후 원요청 재시도
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();
      if (!refreshToken) { clearTokens(); return Promise.reject(error); }
      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken }); // VITE_API_BASE_URL=http://localhost:3000/api
        setTokens(data.accessToken, data.refreshToken, data.userId);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(error.config);
      } catch {
        clearTokens();
      }
    }
    return Promise.reject(error);
  }
);
```

#### api/auth-api.ts
```typescript
// 인증 관련 API 호출
export const authApi = {
  register: (email: string, password: string, name: string) =>
    client.post('/auth/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  
  refreshToken: (refreshToken: string) =>
    client.post('/auth/refresh', { refreshToken }),
};
```

#### hooks/useTodoList.ts
```typescript
// TanStack Query + 필터 상태 관리
export const useTodoList = () => {
  const filters = useFilterStore();
  
  const query = useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoApi.getTodos(filters),
  });
  
  return { todos: query.data || [], isLoading: query.isLoading };
};
```

#### components/todo/TodoList.tsx
```typescript
// UI 렌더링만
interface TodoListProps {
  todos: Todo[];
  onComplete: (todoId: string) => void;
  onEdit: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onComplete,
  onEdit,
  onDelete,
}) => (
  <ul>
    {todos.map((todo) => (
      <TodoItem
        key={todo.todoId}
        todo={todo}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </ul>
);
```

#### pages/TodoListPage.tsx
```typescript
// 페이지 조합 (훅과 컴포넌트 통합)
export const TodoListPage: React.FC = () => {
  const { todos, isLoading } = useTodoList();
  const { mutate: completeTodo } = useCompleteTodo();
  const { mutate: deleteTodo } = useDeleteTodo();
  
  return (
    <div>
      <Header />
      <FilterBar />
      <TodoList
        todos={todos}
        onComplete={(id) => completeTodo(id)}
        onDelete={(id) => deleteTodo(id)}
      />
    </div>
  );
};
```

---

## 7. 백엔드 디렉토리 구조

### 백엔드 디렉토리 구조 및 역할

```
backend/
  src/
    routes/                   # Express 라우터 (엔드포인트 정의)
      index.js              # 라우터 병합
      auth-routes.js        # POST /auth/register, POST /auth/login, POST /auth/refresh
      category-routes.js    # GET /categories, POST /categories, DELETE /categories/:id
      todo-routes.js        # GET /todos, POST /todos, PATCH /todos/:id, DELETE, /complete
      user-routes.js        # PATCH /users/me
    
    controllers/              # HTTP 요청/응답 처리 (라우터와 서비스 사이)
      auth-controller.js    # POST /register, /login, /refresh 처리 로직
      category-controller.js # GET, POST, DELETE 요청 파싱 및 응답 직렬화
      todo-controller.js    # TODO CRUD, 완료 처리 요청 처리
      user-controller.js    # PATCH /users/me 요청 처리
    
    services/                 # 비즈니스 로직 (도메인 규칙 적용)
      user-service.js       # 회원가입, 로그인, 개인정보 수정 비즈니스 로직
      auth-service.js       # JWT 발급, 토큰 검증
      category-service.js   # 카테고리 CRUD, 기본 카테고리 관리
      todo-service.js       # 할일 CRUD, 필터링, 완료 처리 로직
    
    repositories/             # DB 접근 (pg 직접 사용)
      user-repository.js    # users 테이블 쿼리
      category-repository.js # categories 테이블 쿼리
      todo-repository.js    # todos 테이블 쿼리
    
    middlewares/              # Express 미들웨어
      auth-middleware.js    # JWT 토큰 검증
      error-handler.js      # 에러 처리 (try-catch 통합)
      request-logger.js     # 요청 로깅 (민감 정보 제외)
    
    db/                       # 데이터베이스 설정
      pool.js               # pg Pool 생성 및 설정
      migrations/           # SQL 마이그레이션 파일
        001-create-users.sql
        002-create-categories.sql
        003-create-todos.sql
        004-init-default-categories.sql
    
    utils/                    # 유틸리티 함수
      jwt-utils.js          # JWT 발급, 검증 함수
      password-utils.js     # bcrypt 암호화, 비교
      date-utils.js         # 날짜 포맷, 비교
      validation.js         # 이메일, 비밀번호, 필드 검증
    
    constants/                # 상수
      error-codes.js        # ERROR_CODES 객체
      messages.js           # 에러/성공 메시지
      defaults.js           # DEFAULT_CATEGORY_NAMES 등
      validation.js         # 정규식, 최소/최대 길이
    
    app.js                   # Express 앱 설정 (미들웨어 등록, 라우터 마운트)
    server.js               # 포트 리스닝, 진입점
  
  __tests__/                  # 테스트 코드
    unit/
      services/
        user-service.test.js
        todo-service.test.js
    integration/
      auth-api.test.js
      todo-api.test.js
  
  .env.example               # 필수 환경변수 템플릿
  package.json
  jest.config.js            # 테스트 설정
```

### 주요 파일별 역할 설명

#### routes/auth-routes.ts
```typescript
// Express 라우터 정의
import { Router } from 'express';
import { authController } from '../controllers/auth-controller';

export const authRoutes = Router();

authRoutes.post('/register', (req, res, next) => {
  authController.register(req, res).catch(next);
});

authRoutes.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

authRoutes.post('/refresh', (req, res, next) => {
  authController.refreshToken(req, res).catch(next);
});
```

#### controllers/auth-controller.ts
```typescript
// 요청/응답 처리
export const authController = {
  register: async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    
    // 기본 유효성 검증
    if (!email || !password || !name) {
      throw new AppError('INVALID_INPUT', 'Missing required fields', 400);
    }
    
    // Service 호출 (비즈니스 로직)
    const user = await userService.createUser(email, password, name);
    
    // 응답 직렬화
    res.status(201).json({ user });
  },
};
```

#### services/user-service.ts
```typescript
// 비즈니스 로직
export const userService = {
  createUser: async (email: string, password: string, name: string) => {
    // 도메인 규칙: 이메일 중복 확인
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('DUPLICATE_EMAIL', 'Email already in use', 409);
    }
    
    // 비밀번호 암호화 (도메인 규칙)
    const hashedPassword = await hashPassword(password);
    
    // Repository 호출 (DB 접근)
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
    
    return user;
  },
};
```

#### repositories/user-repository.ts
```typescript
// DB 접근 (pg 직접 사용)
import { pool } from '../db/pool';

export const userRepository = {
  findByEmail: async (email: string) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
  },
  
  create: async (data: { email: string; password: string; name: string }) => {
    const query = `
      INSERT INTO users (user_id, email, password, name, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, now(), now())
      RETURNING user_id, email, name, created_at, updated_at
    `;
    const result = await pool.query(query, [data.email, data.password, data.name]);
    return mapRowToUser(result.rows[0]);
  },
};

// snake_case → camelCase 변환 (Repository 내에서만!)
const mapRowToUser = (row: any) => ({
  userId: row.user_id,
  email: row.email,
  name: row.name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});
```

#### db/pool.ts
```typescript
// pg Pool 설정
import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
```

#### migrations/001-create-users.sql
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
```

#### migrations/002-create-categories.sql
```sql
CREATE TABLE categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
```

#### migrations/003-create-todos.sql
```sql
CREATE TABLE todos (
  todo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_user_completed ON todos(user_id, is_completed);
```

#### migrations/004-init-default-categories.sql
```sql
-- 기본 카테고리 (user_id = NULL, is_default = true)
INSERT INTO categories (category_id, user_id, name, is_default, created_at)
VALUES
  (gen_random_uuid(), NULL, '업무', true, now()),
  (gen_random_uuid(), NULL, '개인', true, now()),
  (gen_random_uuid(), NULL, '쇼핑', true, now())
ON CONFLICT DO NOTHING;
```

#### app.ts
```typescript
// Express 앱 설정
import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth-routes';
import { categoryRoutes } from './routes/category-routes';
import { todoRoutes } from './routes/todo-routes';
import { authMiddleware } from './middlewares/auth-middleware';
import { errorHandler } from './middlewares/error-handler';

const app = express();

// 미들웨어
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') }));

// 라우터
app.use('/api/auth', authRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/todos', authMiddleware, todoRoutes);

// 에러 핸들러 (마지막)
app.use(errorHandler);

export default app;
```

---

## 원칙 요약 테이블

| 분류 | ID | 원칙 | 키 개념 |
|---|---|---|---|
| **공통** | P-COM-01 | 단방향 의존성 | UI → App → Domain → Infrastructure |
| | P-COM-02 | 관심사 분리 | 각 모듈은 단 하나의 책임만 |
| | P-COM-03 | 단일 책임 원칙 | 변경 이유가 최소 1개 |
| | P-COM-04 | 도메인 언어 | userId, todoId, dueDate 등 정확한 용어 사용 |
| **백엔드 레이어** | P-BE-01 | 백엔드 5계층 아키텍처 | Router → Controller → Service → Repository → DB |
| | P-BE-02 | 프론트엔드 4계층 아키텍처 | Page → Component → Hook → API Client |
| | P-BE-03 | 순환 의존성 금지 | A → B → A 구조 절대 금지 |
| | P-BE-04 | Repository는 pg 직접 사용 | ORM(TypeORM, Sequelize, Prisma 등) 절대 금지 |
| | P-BE-05 | Controller는 Service 호출 전담 | DB 직접 접근 금지 |
| **프론트엔드 레이어** | P-FE-01 | Component는 UI 렌더링만 | 비즈니스 로직은 Hook에 위임 |
| | P-FE-02 | Hook은 TanStack Query 기반 | 서버 상태 관리 전담 |
| | P-FE-03 | CSS 테마 구조 준비 | 1차부터 CSS Custom Properties 기반 테마 구조 준비 |
| **네이밍** | P-NAM-01 | 파일명 컨벤션 | 백엔드: kebab-case, 컴포넌트: PascalCase, 훅: camelCase |
| | P-NAM-02 | 변수 네이밍 | camelCase, Boolean: is/has, 이벤트: handle |
| | P-NAM-03 | DB 변환 위치 | snake_case ↔ camelCase는 Repository에서만 |
| | P-NAM-04 | API URL | /api/[resource-name], kebab-case, 복수형 |
| | P-NAM-05 | 상수 | UPPER_SNAKE_CASE |
| | P-NAM-06 | 타입 네이밍 | PascalCase, I 접두사 금지 |
| **테스트** | P-TEST-01 | 테스트 범위 | Service: 단위, API: 통합 |
| | P-TEST-02 | 테스트 위치 | 대상 파일과 동일 디렉토리, 백엔드 .test.js / 프론트엔드 .test.ts |
| | P-TEST-03 | Repository 테스트 | 테스트 DB 또는 pg mock, ORM mock 금지 |
| | P-TEST-04 | 커버리지 | Service 80%, Repository 70%, CI 강제 |
| | P-TEST-05 | 자동화 도구 | ESLint + Prettier 필수 |
| **설정/보안** | P-CONFIG-01 | 환경변수 | .env 커밋 금지, .env.example 제공 |
| | P-CONFIG-02 | 필수 변수 | DB_HOST, DB_NAME, JWT_SECRET 등 9개 |
| | P-CONFIG-03 | JWT 시크릿 | 환경변수, 최소 32자 |
| | P-CONFIG-04 | SQL Injection | pg 파라미터 바인딩($1, $2) 필수 |
| | P-CONFIG-05 | CORS 설정 | Origin 명시, 와일드카드는 개발만 |
| | P-CONFIG-06 | 민감 정보 로그 | 비밀번호, 토큰 절대 로그 금지 |
| | P-CONFIG-07 | 에러 응답 | `{ "error": { "code": "...", "message": "..." } }` |

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| 1.0.0 | 2026-05-13 | 초안 작성 |
| 1.0.1 | 2026-05-13 | IS-02: 원칙 요약 테이블 ID 본문과 동기화, IS-05: P-FE-03 CSS 테마 구조 준비 원칙 추가 |
| 1.0.2 | 2026-05-13 | 토큰 저장 방식 변경: localStorage/Cookie → Zustand in-memory. auth-store.ts 코드 예시 및 axios 인터셉터 예시 추가 |

---

**문서 작성 완료**
