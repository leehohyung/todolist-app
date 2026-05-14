const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger/swagger.json');
const { config } = require('./config');
const { errorHandler } = require('./middlewares/error-handler');

const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const categoryRoutes = require('./routes/category-routes');
const todoRoutes = require('./routes/todo-routes');

const app = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

// 요청 로깅
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'TodoListApp API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/todos', todoRoutes);

app.use(errorHandler);

module.exports = { app };
