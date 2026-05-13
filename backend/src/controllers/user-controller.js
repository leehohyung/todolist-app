const { userService } = require('../services/user-service');

const userController = {
  async updateProfile(req, res, next) {
    try {
      const { name, currentPassword, newPassword } = req.body;
      const user = await userService.updateProfile(req.userId, { name, currentPassword, newPassword });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { userController };
