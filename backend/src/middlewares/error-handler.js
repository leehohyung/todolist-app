const { AppError } = require('../types/errors');
const { ErrorCode } = require('../constants/error-codes');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    console.warn(`[ERROR] ${err.statusCode} ${err.code} - ${req.method} ${req.path} - ${err.message}`);
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }
  console.error(`[ERROR] 500 INTERNAL - ${req.method} ${req.path} -`, err.message);
  res.status(500).json({
    error: { code: ErrorCode.INTERNAL_SERVER_ERROR, message: '서버 오류가 발생했습니다.' },
  });
}

module.exports = { errorHandler };
