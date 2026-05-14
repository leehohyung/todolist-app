const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[AUTH] 토큰 없음 -', req.method, req.path);
    return next(new AppError(ErrorCode.UNAUTHORIZED, 401, '인증이 필요합니다.'));
  }
  const token = authHeader.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    console.log(`[AUTH] 인증 성공 - userId: ${decoded.userId}`);
    next();
  } catch {
    console.warn('[AUTH] 유효하지 않은 토큰 -', req.method, req.path);
    next(new AppError(ErrorCode.INVALID_TOKEN, 401, '유효하지 않은 토큰입니다.'));
  }
}

module.exports = { authMiddleware };
