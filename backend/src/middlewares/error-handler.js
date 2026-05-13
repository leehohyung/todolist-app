const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }
  console.error('[ERROR]', err.message);
  res.status(500).json({
    error: { code: ErrorCode.INTERNAL_SERVER_ERROR, message: '서버 오류가 발생했습니다.' },
  });
}

module.exports = { errorHandler };
