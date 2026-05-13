const express = require('express');
const cors = require('cors');
const { config } = require('./config');
const { errorHandler } = require('./middlewares/error-handler');

const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const categoryRoutes = require('./routes/category-routes');
const todoRoutes = require('./routes/todo-routes');

const app = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/todos', todoRoutes);

app.use(errorHandler);

module.exports = { app };
