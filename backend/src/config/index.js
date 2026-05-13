const dotenv = require('dotenv');

dotenv.config();

function required(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  db: {
    host: required('DB_HOST'),
    port: parseInt(required('DB_PORT'), 10),
    name: required('DB_NAME'),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
};

module.exports = { config };
