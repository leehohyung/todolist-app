const { userRepository } = require('../repositories/user-repository');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

const authService = {
  async register(email, password, name) {
    console.log(`[AUTH] 회원가입 시도 - email: ${email}`);
    // BR-01: 이메일 중복 확인
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      console.warn(`[AUTH] 회원가입 실패 - 이메일 중복: ${email}`);
      throw new AppError(ErrorCode.DUPLICATE_EMAIL, 409, '이미 사용 중인 이메일입니다.');
    }
    // BR-02: 비밀번호 해싱 (bcrypt, saltRounds >= 10)
    const hashedPassword = await hashPassword(password);
    const user = await userRepository.create(email, hashedPassword, name);
    console.log(`[AUTH] 회원가입 성공 - userId: ${user.userId}, email: ${email}`);
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async login(email, password) {
    console.log(`[AUTH] 로그인 시도 - email: ${email}`);
    const user = await userRepository.findByEmail(email);
    if (!user) {
      console.warn(`[AUTH] 로그인 실패 - 존재하지 않는 이메일: ${email}`);
      throw new AppError(ErrorCode.UNAUTHORIZED, 401, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      console.warn(`[AUTH] 로그인 실패 - 비밀번호 불일치, userId: ${user.userId}`);
      throw new AppError(ErrorCode.UNAUTHORIZED, 401, '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const accessToken = generateAccessToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);
    console.log(`[AUTH] 로그인 성공 - userId: ${user.userId}`);
    return { accessToken, refreshToken, userId: user.userId, userName: user.name, expiresIn: 3600 };
  },

  async refreshTokens(refreshToken) {
    console.log('[AUTH] 토큰 갱신 시도');
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      console.warn('[AUTH] 토큰 갱신 실패 - 유효하지 않은 리프레시 토큰');
      throw new AppError(ErrorCode.INVALID_TOKEN, 401, '유효하지 않은 리프레시 토큰입니다.');
    }
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      console.warn(`[AUTH] 토큰 갱신 실패 - 존재하지 않는 userId: ${decoded.userId}`);
      throw new AppError(ErrorCode.NOT_FOUND, 404, '사용자를 찾을 수 없습니다.');
    }
    console.log(`[AUTH] 토큰 갱신 성공 - userId: ${user.userId}`);
    return {
      accessToken: generateAccessToken(user.userId),
      refreshToken: generateRefreshToken(user.userId),
      expiresIn: 3600,
    };
  },
};

module.exports = { authService };
