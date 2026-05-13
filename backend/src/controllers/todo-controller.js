const { todoService } = require('../services/todo-service');

const todoController = {
  async getTodos(req, res, next) {
    try {
      const { categoryId, dueDate, isCompleted } = req.query;
      const filters = {};
      if (categoryId) filters.categoryId = categoryId;
      if (dueDate) filters.dueDate = dueDate;
      if (isCompleted !== undefined) filters.isCompleted = isCompleted === 'true';
      const todos = await todoService.getTodos(req.userId, filters);
      res.json({ todos });
    } catch (err) {
      next(err);
    }
  },

  async createTodo(req, res, next) {
    try {
      const { title, categoryId, dueDate, memo } = req.body;
      const todo = await todoService.createTodo(req.userId, { title, categoryId, dueDate, memo });
      res.status(201).json({ todo });
    } catch (err) {
      next(err);
    }
  },

  async updateTodo(req, res, next) {
    try {
      const { todoId } = req.params;
      const { title, categoryId, dueDate, memo } = req.body;
      const todo = await todoService.updateTodo(req.userId, todoId, {
        title,
        categoryId,
        dueDate,
        memo,
      });
      res.json({ todo });
    } catch (err) {
      next(err);
    }
  },

  async deleteTodo(req, res, next) {
    try {
      const { todoId } = req.params;
      await todoService.deleteTodo(req.userId, todoId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async toggleCompletion(req, res, next) {
    try {
      const { todoId } = req.params;
      const todo = await todoService.toggleCompletion(req.userId, todoId);
      res.json({ todo });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { todoController };
