# TodoListApp 기술 아키텍처 다이어그램

**버전:** 1.0.0
**작성일:** 2026-05-13
**참조:** docs/2-prd.md, docs/4-project-structure-principles.md

---

## 1. 시스템 전체 구조

```mermaid
graph TD
    Browser["🌐 브라우저<br/>반응형 웹"]
    Frontend["⚛️ 프론트엔드<br/>React 19 + TypeScript"]
    Backend["🟢 백엔드<br/>Node.js + Express REST API"]
    Database["🗄️ PostgreSQL 17"]
    
    Browser -->|HTTP/HTTPS| Frontend
    Frontend -->|REST API<br/>+JWT Token| Backend
    Backend -->|SQL Query<br/>pg Driver| Database
    
    style Browser fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Frontend fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style Backend fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Database fill:#ffe0b2,stroke:#e65100,stroke-width:2px
```

시스템은 반응형 웹 UI(프론트엔드), REST API 백엔드, PostgreSQL 데이터베이스로 구성되며, JWT 인증으로 보호됩니다.

---

## 2. 백엔드 레이어 구조

```mermaid
graph LR
    Router["📍 Router<br/>auth-routes.ts"]
    Controller["🎛️ Controller<br/>auth-controller.ts"]
    Service["⚙️ Service<br/>user-service.ts"]
    Repository["📊 Repository<br/>user-repository.ts"]
    DB["🗄️ PostgreSQL"]
    
    Router -->|HTTP| Controller
    Controller -->|비즈니스로직| Service
    Service -->|쿼리실행| Repository
    Repository -->|pg Driver| DB
    
    style Router fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style Controller fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style Service fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Repository fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style DB fill:#ffe0b2,stroke:#e65100,stroke-width:2px
```

요청은 Router → Controller → Service → Repository 순서로 흐르며, Repository는 pg를 통해 직접 SQL을 실행합니다.

---

## 3. 프론트엔드 레이어 구조

```mermaid
graph LR
    Page["📄 Page<br/>TodoListPage.tsx"]
    Component["🎨 Component<br/>TodoList.tsx"]
    Hook["🪝 Hook<br/>useTodoList.ts"]
    Store["🏪 Store<br/>Zustand"]
    ApiClient["🌐 API Client<br/>todo-api.ts"]
    Backend["🟢 Backend"]
    
    Page -->|Props| Component
    Page -->|데이터관리| Hook
    Page -->|상태관리| Store
    Hook -->|TanStack Query| ApiClient
    Store -->|클라이언트상태| Page
    ApiClient -->|REST API| Backend
    
    style Page fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style Component fill:#bbdefb,stroke:#1565c0,stroke-width:2px
    style Hook fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style Store fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style ApiClient fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style Backend fill:#ffe0b2,stroke:#e65100,stroke-width:2px
```

Page는 Component, Hook, Store를 조합하여 화면을 구성하며, Hook은 TanStack Query로 서버 상태를 관리하고 API Client를 통해 백엔드와 통신합니다.
