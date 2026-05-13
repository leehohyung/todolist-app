const { categoryService } = require('../services/category-service');

const categoryController = {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getCategoriesForUser(req.userId);
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  },

  async createCategory(req, res, next) {
    try {
      const { name } = req.body;
      const category = await categoryService.createCategory(req.userId, name);
      res.status(201).json({ category });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      await categoryService.deleteCategory(req.userId, categoryId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { categoryController };
