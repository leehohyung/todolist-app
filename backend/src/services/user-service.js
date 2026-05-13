const { userRepository } = require('../repositories/user-repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

const userService = {
  async updateProfile(userId, { name, currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '사용자를 찾을 수 없습니다.');
    }
    if (name) {
      await userRepository.updateName(userId, name);
    }
    if (newPassword) {
      if (!currentPassword) {
        throw new AppError(ErrorCode.INVALID_INPUT, 400, '현재 비밀번호를 입력해주세요.');
      }
      const valid = await comparePassword(currentPassword, user.password);
      if (!valid) {
        throw new AppError(ErrorCode.UNAUTHORIZED, 401, '현재 비밀번호가 올바르지 않습니다.');
      }
      const hashed = await hashPassword(newPassword);
      await userRepository.updatePassword(userId, hashed);
    }
    const updated = await userRepository.findById(userId);
    const { password: _, ...safeUser } = updated;
    return safeUser;
  },
};

module.exports = { userService };
