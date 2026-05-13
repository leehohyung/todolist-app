const { Router } = require('express');
const { userController } = require('../controllers/user-controller');
const { authMiddleware } = require('../middlewares/auth-middleware');

const router = Router();

router.patch('/me', authMiddleware, userController.updateProfile);

module.exports = router;
