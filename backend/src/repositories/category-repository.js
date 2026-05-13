const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    categoryId: row.category_id,
    userId: row.user_id,
    name: row.name,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

const categoryRepository = {
  async findAllForUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM categories
       WHERE user_id IS NULL OR user_id = $1
       ORDER BY is_default DESC, created_at ASC`,
      [userId],
    );
    return rows.map(mapRow);
  },

  async findById(categoryId) {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE category_id = $1',
      [categoryId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findDefaultByName(name) {
    const { rows } = await pool.query(
      'SELECT * FROM categories WHERE is_default = true AND name = $1',
      [name],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async create(userId, name) {
    const { rows } = await pool.query(
      `INSERT INTO categories (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, name],
    );
    return mapRow(rows[0]);
  },

  async delete(categoryId) {
    await pool.query('DELETE FROM categories WHERE category_id = $1', [categoryId]);
  },

  async reclassifyTodos(fromCategoryId, toCategoryId) {
    await pool.query(
      'UPDATE todos SET category_id = $1 WHERE category_id = $2',
      [toCategoryId, fromCategoryId],
    );
  },
};

module.exports = { categoryRepository };
