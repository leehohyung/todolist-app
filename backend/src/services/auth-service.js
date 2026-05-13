const { userRepository } = require('../repositories/user-repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

const authService = {
  async register(email, password, name) {
    // BR-01: 이메일 중복 확인
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(ErrorCode.DUPLICATE_EMAIL, 409, '이미 사용 중인 이메일입니다.');
    }
    // BR-02: 비밀번호 해싱 (bcrypt, saltRounds >= 10)
    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create(email, hashedPassword, name);
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 401, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 401, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const accessToken = generateAccessToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);
    return { accessToken, refreshToken, userId: user.userId, expiresIn: 3600 };
  },

  async refreshTokens(refreshToken) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(ErrorCode.INVALID_TOKEN, 401, '유효하지 않은 리프레시 토큰입니다.');
    }
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, '사용자를 찾을 수 없습니다.');
    }
    return {
      accessToken: generateAccessToken(user.userId),
      refreshToken: generateRefreshToken(user.userId),
      expiresIn: 3600,
    };
  },
};

module.exports = { authService };
