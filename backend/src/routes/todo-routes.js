const { Router } = require('express');
const { todoController } = require('../controllers/todo-controller');
const { authMiddleware } = require('../middlewares/auth-middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.patch('/:todoId', todoController.updateTodo);
router.delete('/:todoId', todoController.deleteTodo);
router.patch('/:todoId/complete', todoController.toggleCompletion);

module.exports = router;
