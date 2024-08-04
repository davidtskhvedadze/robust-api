const express = require('express');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const postRoutes = require('./routes/postRoutes');
const promClient = require('prom-client');

const app = express();

// Middleware for logging
app.use(loggingMiddleware);

// Routes
app.use('/v1', postRoutes);

module.exports = app;
