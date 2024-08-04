const express = require('express');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const metricsMiddleware = require('./middleware/metricsMiddleware');
const postRoutes = require('./routes/postRoutes');
const promClient = require('prom-client');
const logger = require('../src/utils/logger')

const app = express();

// Middleware for logging and metrics
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// Routes
app.use('/v1', postRoutes);

// Endpoint to expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
