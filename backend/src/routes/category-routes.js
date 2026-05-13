const { Router } = require('express');
const { categoryController } = require('../controllers/category-controller');
const { authMiddleware } = require('../middlewares/auth-middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.post('/', categoryController.createCategory);
router.delete('/:categoryId', categoryController.deleteCategory);

module.exports = router;
