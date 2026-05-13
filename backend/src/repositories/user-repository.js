const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    userId: row.user_id,
    email: row.email,
    password: row.password,
    name: row.name,
    provider: row.provider,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const userRepository = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findById(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(email, hashedPassword, name) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, hashedPassword, name],
    );
    return mapRow(rows[0]);
  },

  async updateName(userId, name) {
    const { rows } = await pool.query(
      `UPDATE users SET name = $1 WHERE user_id = $2 RETURNING *`,
      [name, userId],
    );
    return mapRow(rows[0]);
  },

  async updatePassword(userId, hashedPassword) {
    await pool.query(
      `UPDATE users SET password = $1 WHERE user_id = $2`,
      [hashedPassword, userId],
    );
  },

  async delete(userId) {
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
  },
};

module.exports = { userRepository };
