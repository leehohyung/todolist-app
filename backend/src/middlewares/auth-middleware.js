const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(ErrorCode.UNAUTHORIZED, 401, '인증이 필요합니다.'));
  }
  const token = authHeader.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch {
    next(new AppError(ErrorCode.INVALID_TOKEN, 401, '유효하지 않은 토큰입니다.'));
  }
}

module.exports = { authMiddleware };
