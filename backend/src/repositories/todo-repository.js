const { pool } = require('../db/pool');

function mapRow(row) {
  return {
    todoId: row.todo_id,
    userId: row.user_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const todoRepository = {
  async findById(todoId) {
    const { rows } = await pool.query(
      'SELECT * FROM todos WHERE todo_id = $1',
      [todoId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findByIdAndUserId(todoId, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM todos WHERE todo_id = $1 AND user_id = $2',
      [todoId, userId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findAllByUserId(userId, filters = {}) {
    const conditions = ['user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (filters.categoryId) {
      conditions.push(`category_id = $${idx++}`);
      params.push(filters.categoryId);
    }
    if (filters.startDate) {
      conditions.push(`due_date >= $${idx++}`);
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push(`due_date <= $${idx++}`);
      params.push(filters.endDate);
    }
    if (filters.isCompleted !== undefined) {
      conditions.push(`is_completed = $${idx++}`);
      params.push(filters.isCompleted);
    }

    const { rows } = await pool.query(
      `SELECT * FROM todos WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      params,
    );
    return rows.map(mapRow);
  },

  async create(userId, data) {
    const { rows } = await pool.query(
      `INSERT INTO todos (user_id, category_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, data.categoryId, data.title, data.description ?? null, data.dueDate ?? null],
    );
    return mapRow(rows[0]);
  },

  async update(todoId, data) {
    const sets = [];
    const params = [];
    let idx = 1;

    if (data.title !== undefined) { sets.push(`title = $${idx++}`); params.push(data.title); }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); params.push(data.description); }
    if (data.categoryId !== undefined) { sets.push(`category_id = $${idx++}`); params.push(data.categoryId); }
    if (data.dueDate !== undefined) { sets.push(`due_date = $${idx++}`); params.push(data.dueDate); }

    params.push(todoId);
    const { rows } = await pool.query(
      `UPDATE todos SET ${sets.join(', ')} WHERE todo_id = $${idx} RETURNING *`,
      params,
    );
    return mapRow(rows[0]);
  },

  async updateCompletion(todoId, isCompleted) {
    const { rows } = await pool.query(
      `UPDATE todos
       SET is_completed = $1,
           completed_at = $2
       WHERE todo_id = $3
       RETURNING *`,
      [isCompleted, isCompleted ? new Date() : null, todoId],
    );
    return mapRow(rows[0]);
  },

  async delete(todoId) {
    await pool.query('DELETE FROM todos WHERE todo_id = $1', [todoId]);
  },
};

module.exports = { todoRepository };
