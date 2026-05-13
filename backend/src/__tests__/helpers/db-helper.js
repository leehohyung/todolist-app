'use strict';

// This module is required AFTER process.env.DB_NAME has been set to 'todolist_test'
// in the calling test file.

let _pool = null;

function getPool() {
  if (!_pool) {
    jest.resetModules();
    const { Pool } = require('pg');
    _pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'todolist_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
  }
  return _pool;
}

async function cleanDatabase() {
  const pool = getPool();
  // Delete in dependency order to avoid FK violations.
  // We do NOT use TRUNCATE ... CASCADE because that would wipe default categories.
  await pool.query('DELETE FROM todos');
  await pool.query('DELETE FROM categories WHERE is_default = false');
  await pool.query('DELETE FROM users');
  // Ensure default categories still exist (they should have survived the above deletes,
  // but re-seed if they are missing — e.g. after a first-time setup or a test that wiped them).
  const { rows } = await pool.query('SELECT COUNT(*) AS cnt FROM categories WHERE is_default = true');
  if (parseInt(rows[0].cnt, 10) === 0) {
    await pool.query(`
      INSERT INTO categories (name, user_id, is_default)
      VALUES ('업무', NULL, true), ('개인', NULL, true), ('쇼핑', NULL, true)
    `);
  }
}

async function createTestUser(overrides = {}) {
  const pool = getPool();
  const bcrypt = require('bcrypt');
  const email = overrides.email || `testuser_${Date.now()}@example.com`;
  const password = overrides.password || 'testpassword123';
  const name = overrides.name || 'Test User';

  const hashedPassword = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *`,
    [email, hashedPassword, name],
  );
  return {
    userId: rows[0].user_id,
    email: rows[0].email,
    name: rows[0].name,
    plainPassword: password,
  };
}

async function endPool() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

module.exports = { getPool, cleanDatabase, createTestUser, endPool };
