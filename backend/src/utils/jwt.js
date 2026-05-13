const jwt = require('jsonwebtoken');
const { config } = require('../config');

function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.accessExpiresIn });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
