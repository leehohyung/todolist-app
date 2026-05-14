-- =============================================================================
-- TodoListApp Database Schema
-- PostgreSQL 17
-- 참조: docs/6-erd.md, docs/2-prd.md
-- =============================================================================

-- pgcrypto 확장: gen_random_uuid() 사용
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. users
-- =============================================================================
CREATE TABLE users (
    user_id    UUID         NOT NULL DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(100) NOT NULL,
    provider   VARCHAR(50)  NOT NULL DEFAULT 'local',  -- OAuth 확장 예비 ('local' | 'google' | 'facebook')
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT users_pkey       PRIMARY KEY (user_id),
    CONSTRAINT users_email_ukey UNIQUE (email)
);

-- 로그인 조회 성능
CREATE INDEX idx_users_email ON users (email);

-- =============================================================================
-- 2. categories
-- =============================================================================
-- user_id = NULL  → 시스템 기본 카테고리 (is_default = true, 수정/삭제 불가)
-- user_id = <id>  → 사용자 정의 카테고리 (is_default = false)
CREATE TABLE categories (
    category_id UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID,                                  -- NULL: 기본 카테고리
    name        VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT categories_pkey    PRIMARY KEY (category_id),
    CONSTRAINT categories_user_fk FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE CASCADE
);

-- 사용자별 카테고리 조회
CREATE INDEX idx_categories_user_id ON categories (user_id);

-- =============================================================================
-- 3. todos
-- =============================================================================
CREATE TABLE todos (
    todo_id      UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,                                 -- NULL 허용
    due_date     TIMESTAMP,                               -- NULL 허용
    is_completed BOOLEAN      NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,                          -- NULL: 미완료, 값 있음: 완료 일시
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT todos_pkey        PRIMARY KEY (todo_id),
    CONSTRAINT todos_user_fk     FOREIGN KEY (user_id)
        REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT todos_category_fk FOREIGN KEY (category_id)
        REFERENCES categories (category_id) ON DELETE RESTRICT
    -- RESTRICT: 카테고리 삭제 시 애플리케이션 레이어에서 먼저 재분류 후 삭제
);

-- 사용자별 할일 목록 조회 (주요 쿼리)
CREATE INDEX idx_todos_user_id     ON todos (user_id);
-- 카테고리별 필터
CREATE INDEX idx_todos_category_id ON todos (category_id);
-- 완료 여부 필터 (user_id 조건과 함께 복합 사용)
CREATE INDEX idx_todos_user_completed ON todos (user_id, is_completed);
-- 기한 초과 판정: due_date < today AND is_completed = false
CREATE INDEX idx_todos_due_date    ON todos (due_date) WHERE due_date IS NOT NULL;

-- =============================================================================
-- 4. updated_at 자동 갱신 트리거
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 5. 기본 카테고리 초기 데이터
-- =============================================================================
-- user_id = NULL, is_default = true → 전체 사용자 공유, 수정/삭제 불가
INSERT INTO categories (name, user_id, is_default)
VALUES
    ('업무',   NULL, true),
    ('개인',   NULL, true),
    ('쇼핑',   NULL, true)
ON CONFLICT DO NOTHING;
