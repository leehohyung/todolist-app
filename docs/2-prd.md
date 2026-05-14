# TodoListApp PRD (Product Requirements Document)

**버전:** 1.0.0
**작성일:** 2026-05-13
**상태:** 초안
**참조:** docs/1-domain-definition.md

---

## 1. 제품 개요

### 1.1 목적

TodoListApp은 인증 기반의 개인 할일 관리 웹 플랫폼이다. 20대~50대 직장인이 업무와 일상에서 발생하는 할일을 카테고리별로 체계적으로 관리하고 생산성을 높일 수 있도록 돕는다.

### 1.2 타겟 사용자

| 항목 | 내용 |
|---|---|
| 주요 사용자 | 20대~50대 직장인 |
| 사용 목적 | 업무 및 개인 할일의 체계적 추적과 완료 관리 |
| 사용 환경 | 데스크톱 브라우저, 모바일 브라우저 |
| 기술 친숙도 | 일반 수준 (복잡한 설정 없이 직관적으로 사용 가능해야 함) |

### 1.3 지원 플랫폼

- **Web**: 데스크톱 브라우저 (Chrome, Safari, Edge 최신 버전)
- **Mobile Web**: 모바일 브라우저 (iOS Safari, Android Chrome)
- **UI 방식**: 반응형 웹 (Responsive Web UI) — 별도 네이티브 앱 없음

---

## 2. 기술 스택

### 2.1 프론트엔드

| 항목 | 기술 |
|---|---|
| 프레임워크 | React 19 + TypeScript |
| 상태 관리 | Zustand |
| 서버 상태 / 데이터 페칭 | TanStack Query (React Query v5) |
| UI | 반응형 CSS (모바일 우선 설계) |

### 2.2 백엔드

| 항목 | 기술 |
|---|---|
| 런타임 | Node.js |
| 프레임워크 | Express |
| API 방식 | REST API |
| DB 드라이버 | **pg** (node-postgres) — ORM 사용 금지, pg 직접 사용 필수 |

### 2.3 데이터베이스

| 항목 | 기술 |
|---|---|
| DBMS | PostgreSQL 17 |

### 2.4 인증

| 단계 | 방식 |
|---|---|
| 1차 (MVP) | JWT (Access Token + Refresh Token) |
| 2차 (향후 확장) | OAuth Social 로그인 (Google, Facebook 등) |

> JWT 발급 구조와 토큰 저장 방식은 OAuth 확장을 고려하여 설계한다. 사용자 테이블에 `provider` 컬럼을 예비 포함한다. 토큰은 XSS 공격 노출을 최소화하기 위해 **Zustand 메모리(in-memory)에만 저장**하며 localStorage / Cookie에 저장하지 않는다. 페이지 새로고침 시 토큰이 초기화되므로 로그인 상태가 해제된다.

---

## 3. 비기능 요구사항

| 항목 | 요구사항 |
|---|---|
| 동시 접속자 | 최대 300명 |
| 프로젝트 규모 | 소규모 개인 프로젝트 |
| 데이터 보존 | 회원 탈퇴 시 해당 사용자의 모든 데이터(할일, 카테고리) 즉시 삭제 |
| 보안 | 비밀번호 bcrypt 해싱 저장, JWT 서명 검증, 본인 소유 데이터만 접근 가능 |
| 응답 속도 | 주요 API 응답 2초 이내 (P95 기준) |
| 다크 모드 | 2차 확장 예정, 1차 미포함 |
| 다국어 지원 | 2차 확장 예정, 1차 미포함 (1차는 한국어 단일 언어) |

---

## 4. 기능 요구사항

### 4.1 MVP 범위 (1차 릴리즈 — 3일 내 완료)

도메인 정의서 유스케이스(UC-01 ~ UC-10) 전체를 1차 MVP로 포함한다.

#### 4.1.1 인증 (Auth)

| UC-ID | 기능 | 상세 요구사항 |
|---|---|---|
| UC-01 | 회원가입 | 이메일(유일값), 비밀번호, 이름 입력. 비밀번호 bcrypt 암호화 저장. 중복 이메일 가입 차단. |
| UC-02 | 로그인 | 이메일 + 비밀번호 검증 후 JWT Access Token 발급. |
| — | 로그아웃 | 클라이언트 측 토큰 삭제. |
| UC-03 | 개인정보 수정 | 인증 사용자 본인의 이름 또는 비밀번호 변경. |

**토큰 정책**
- Access Token 유효기간: 1시간
- Refresh Token 유효기간: 7일
- Authorization 헤더(`Bearer` 방식)로 전달
- **토큰 저장 위치: Zustand 메모리(in-memory)** — localStorage, sessionStorage, Cookie 사용 금지
- 페이지 새로고침 시 토큰 초기화 → 로그인 화면으로 이동

#### 4.1.2 카테고리 (Category)

| UC-ID | 기능 | 상세 요구사항 |
|---|---|---|
| — | 기본 카테고리 제공 | 시스템이 전체 사용자에게 공통 제공. 수정·삭제 불가. 초기 데이터: `업무`, `개인`, `쇼핑` |
| UC-04 | 카테고리 추가 | 인증 사용자가 개인 카테고리 생성. |
| UC-05 | 카테고리 삭제 | 본인 소유 카테고리만 삭제 가능. 삭제 시 해당 카테고리의 할일은 기본 카테고리(`개인`)로 자동 재분류. |
| — | 카테고리 목록 조회 | 기본 카테고리 + 본인 사용자 정의 카테고리 통합 조회. |

#### 4.1.3 할일 (Todo)

| UC-ID | 기능 | 상세 요구사항 |
|---|---|---|
| UC-06 | 할일 등록 | 제목(필수), 카테고리(필수), 설명(선택), 종료 예정일(선택) 입력. |
| UC-07 | 할일 수정 | 제목, 설명, 종료 예정일, 카테고리 수정 가능. 본인 소유만 수정 가능. |
| UC-08 | 할일 삭제 | 본인 소유 할일만 삭제. |
| UC-09 | 할일 완료 처리 | 완료 여부(isCompleted) 토글. 완료 시 completedAt 기록, 완료 취소 시 초기화. |
| UC-10 | 할일 목록 조회 | 카테고리 / 종료 예정일 기간(시작~종료) / 완료 여부(완료·미완료·전체) 필터 단독 또는 조합 적용. |

**기한 초과 규칙**: 종료 예정일 < 오늘 날짜이고 isCompleted = false인 항목은 `overdue` 상태로 표시.

### 4.2 2차 이후 확장 기능 (MVP 제외)

| 기능 | 비고 |
|---|---|
| OAuth Social 로그인 (Google, Facebook) | JWT 구조를 OAuth 확장 고려하여 1차부터 설계 |
| 다크 모드 | UI 테마 분리 설계 |
| 다국어 지원 (i18n) | 문자열 리소스 외부화 설계 |
| 회원 탈퇴 | 계정 및 전체 데이터 즉시 삭제 |
| 할일 우선순위 | 높음·보통·낮음 |
| 알림 / 리마인더 | 기한 초과 알림 |

---

## 5. API 설계 개요 (REST)

### 기본 규칙
- Base URL: `/api`
- 인증 필요 엔드포인트: `Authorization: Bearer <access_token>` 헤더 필수
- 응답 형식: JSON
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`

### 5.1 Auth

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| POST | `/auth/register` | 불필요 | 회원가입 |
| POST | `/auth/login` | 불필요 | 로그인, JWT 발급 |
| POST | `/auth/refresh` | 불필요 | Access Token 재발급 |
| PATCH | `/users/me` | 필요 | 개인정보 수정 |

### 5.2 Category

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/categories` | 필요 | 카테고리 목록 조회 (기본 + 개인) |
| POST | `/categories` | 필요 | 카테고리 생성 |
| DELETE | `/categories/:categoryId` | 필요 | 카테고리 삭제 |

### 5.3 Todo

| Method | Endpoint | 인증 | 설명 |
|---|---|---|---|
| GET | `/todos` | 필요 | 할일 목록 조회 (필터: categoryId, startDate, endDate, isCompleted) |
| POST | `/todos` | 필요 | 할일 등록 |
| PATCH | `/todos/:todoId` | 필요 | 할일 수정 |
| DELETE | `/todos/:todoId` | 필요 | 할일 삭제 |
| PATCH | `/todos/:todoId/complete` | 필요 | 완료 여부 토글 |

---

## 6. 데이터 모델 (DB 스키마 요약)

### users

| 컬럼 | 타입 | 제약 |
|---|---|---|
| user_id | UUID | PK, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| provider | VARCHAR(50) | DEFAULT 'local' (OAuth 확장 예비) |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### categories

| 컬럼 | 타입 | 제약 |
|---|---|---|
| category_id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK → users(user_id) NULL허용 (기본 카테고리는 NULL) |
| name | VARCHAR(100) | NOT NULL |
| is_default | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### todos

| 컬럼 | 타입 | 제약 |
|---|---|---|
| todo_id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK → users(user_id), NOT NULL |
| category_id | UUID | FK → categories(category_id), NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL 허용 |
| due_date | DATE | NULL 허용 |
| is_completed | BOOLEAN | DEFAULT false |
| completed_at | TIMESTAMPTZ | NULL 허용 |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

---

## 7. UX/UI 방향

### 7.1 디자인 원칙

- **직관성 우선**: 20대~50대 직장인이 별도 학습 없이 바로 사용할 수 있는 수준의 단순한 UI
- **모바일 우선 설계**: 브레이크포인트 기준 — 모바일(<768px), 태블릿(768px~1024px), 데스크톱(>1024px)
- **명확한 상태 표시**: 완료 / 미완료 / 기한 초과 상태를 색상 또는 뱃지로 즉시 구분

### 7.2 주요 화면

| 화면 | 설명 |
|---|---|
| 로그인 / 회원가입 | 이메일·비밀번호 입력 폼, 간결한 레이아웃 |
| 할일 목록 | 필터 바(카테고리·기간·완료 여부) + 할일 카드 리스트 |
| 할일 등록/수정 | 제목·설명·카테고리·종료 예정일 입력 폼 (모달 또는 슬라이드 패널) |
| 카테고리 관리 | 기본 카테고리 표시 + 개인 카테고리 추가·삭제 |
| 마이페이지 | 이름·비밀번호 수정 |

### 7.3 2차 확장 예정

- 다크 모드: CSS 변수(Custom Properties) 기반으로 1차부터 테마 구조만 준비
- 다국어(i18n): 1차는 한국어 단일. 문자열 하드코딩 지양, 상수 파일로 분리

---

## 8. 보안 요구사항

| 항목 | 요구사항 |
|---|---|
| 비밀번호 | bcrypt (salt rounds ≥ 10) |
| JWT | HS256 이상, 서버 환경변수로 시크릿 관리 |
| 인가 | 모든 Todo·Category API는 요청자 소유 여부 검증 |
| SQL Injection | pg 라이브러리 파라미터 바인딩($1, $2) 사용 필수, 문자열 직접 조합 금지 |
| CORS | 허용 Origin 명시적 설정 |
| HTTPS | 배포 환경 필수 (개발 환경 제외) |

---

## 9. 개발 일정 (3일)

| 일차 | 작업 범위 |
|---|---|
| Day 1 | DB 스키마 작성 및 마이그레이션, 백엔드 프로젝트 초기 설정, Auth API(회원가입·로그인·JWT 미들웨어) |
| Day 2 | Category API, Todo CRUD + 완료 처리 API, 프론트엔드 프로젝트 초기 설정, 로그인·회원가입·할일 목록 화면 |
| Day 3 | 할일 등록·수정·삭제·필터 UI, 카테고리 관리 UI, 마이페이지, 통합 테스트 및 버그 수정 |

---

## 10. 완료 기준 (Definition of Done)

MVP 릴리즈는 아래 조건을 모두 충족해야 한다.

- [ ] UC-01 ~ UC-10 모든 유스케이스 동작 확인
- [ ] 비인증 접근 시 401 반환 확인
- [ ] 타인 소유 데이터 접근 시 403 반환 확인
- [ ] 기한 초과 할일 상태 표시 정상 동작
- [ ] 카테고리 삭제 시 할일 기본 카테고리 재분류 동작
- [ ] 모바일(375px) 및 데스크톱(1280px) 환경에서 레이아웃 정상 확인
- [ ] 동시 접속 300명 기준 주요 API 응답 2초 이내

---

## 11. 오픈 이슈 및 결정 필요 항목

| # | 항목 | 현재 방향 | 상태 |
|---|---|---|---|
| 1 | Refresh Token 저장 방식 | Zustand 메모리(in-memory) 저장 — localStorage/Cookie 사용 안 함 | **확정** |
| 2 | 기본 카테고리 초기값 목록 | `업무`, `개인`, `쇼핑` | 확정 필요 |
| 3 | 카테고리 삭제 시 재분류 대상 기본 카테고리 | `개인` 카테고리로 고정 | 확정 필요 |
| 4 | 회원 탈퇴 기능 | 2차로 이연 | 확정 |
