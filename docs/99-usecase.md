# TodoListApp Use Case Diagram

**버전:** 1.0.0
**작성일:** 2026-05-13
**참조:** docs/1-domain-definition.md, docs/2-prd.md

---

## 전체 유스케이스 다이어그램

```mermaid
graph LR
    %% ── Actors ──────────────────────────────────────────
    Guest(["👤 비인증 사용자"])
    User(["👤 인증 사용자"])
    System(["⚙️ 시스템"])

    %% ── System Boundary ─────────────────────────────────
    subgraph TodoListApp
        direction TB

        subgraph 인증 관리
            UC01("UC-01\n회원가입")
            UC02("UC-02\n로그인")
            UC03("UC-03\n개인정보 수정")
            SUB_EMAIL("이메일 중복 검증")
            SUB_JWT("JWT 토큰 발급")
            SUB_HASH("비밀번호 암호화")
        end

        subgraph 카테고리 관리
            UC04("UC-04\n카테고리 추가")
            UC05("UC-05\n카테고리 삭제")
            UC_CAT_LIST("카테고리 목록 조회")
            SUB_RECAT("할일 기본 카테고리 재분류")
            SUB_DEFAULT("기본 카테고리 제공")
        end

        subgraph 할일 관리
            UC06("UC-06\n할일 등록")
            UC07("UC-07\n할일 수정")
            UC08("UC-08\n할일 삭제")
            UC09("UC-09\n완료 처리")
            UC10("UC-10\n할일 목록 조회")
            SUB_OVERDUE("기한 초과 상태 판정")
            SUB_FILTER("필터 적용\n카테고리·기간·완료여부")
            SUB_COMPLETE_AT("completedAt 기록/초기화")
        end
    end

    %% ── Actor → Use Case 연결 ───────────────────────────
    Guest --> UC01
    Guest --> UC02

    User --> UC03
    User --> UC04
    User --> UC05
    User --> UC_CAT_LIST
    User --> UC06
    User --> UC07
    User --> UC08
    User --> UC09
    User --> UC10

    System --> SUB_DEFAULT

    %% ── include 관계 ────────────────────────────────────
    UC01 -. "«include»" .-> SUB_EMAIL
    UC01 -. "«include»" .-> SUB_HASH
    UC02 -. "«include»" .-> SUB_JWT
    UC05 -. "«include»" .-> SUB_RECAT
    UC09 -. "«include»" .-> SUB_COMPLETE_AT
    UC10 -. "«include»" .-> SUB_FILTER
    UC10 -. "«include»" .-> SUB_OVERDUE

    %% ── extend 관계 ─────────────────────────────────────
    UC_CAT_LIST -. "«extend»" .-> SUB_DEFAULT

    %% ── 스타일 ──────────────────────────────────────────
    style Guest        fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style User         fill:#dcfce7,stroke:#22c55e,color:#14532d
    style System       fill:#fef9c3,stroke:#eab308,color:#713f12

    style SUB_EMAIL     fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_JWT       fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_HASH      fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_RECAT     fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_DEFAULT   fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_OVERDUE   fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_FILTER    fill:#f1f5f9,stroke:#94a3b8,color:#475569
    style SUB_COMPLETE_AT fill:#f1f5f9,stroke:#94a3b8,color:#475569
```

---

## 유스케이스 목록 요약

| UC-ID | 유스케이스 | 주체 | 관계 |
|---|---|---|---|
| UC-01 | 회원가입 | 비인증 사용자 | «include» 이메일 중복 검증, 비밀번호 암호화 |
| UC-02 | 로그인 | 비인증 사용자 | «include» JWT 토큰 발급 |
| UC-03 | 개인정보 수정 | 인증 사용자 | — |
| UC-04 | 카테고리 추가 | 인증 사용자 | — |
| UC-05 | 카테고리 삭제 | 인증 사용자 | «include» 할일 기본 카테고리 재분류 |
| UC-06 | 할일 등록 | 인증 사용자 | — |
| UC-07 | 할일 수정 | 인증 사용자 | — |
| UC-08 | 할일 삭제 | 인증 사용자 | — |
| UC-09 | 할일 완료 처리 | 인증 사용자 | «include» completedAt 기록/초기화 |
| UC-10 | 할일 목록 조회 | 인증 사용자 | «include» 필터 적용, 기한 초과 상태 판정 |
| — | 기본 카테고리 제공 | 시스템 | «extend» 카테고리 목록 조회 |

---

## 관계 범례

| 표기 | 의미 |
|---|---|
| `실선 →` | 액터가 유스케이스를 직접 실행 |
| `«include»` | 유스케이스 실행 시 반드시 포함되는 하위 동작 |
| `«extend»` | 특정 조건에서 선택적으로 추가되는 동작 |
