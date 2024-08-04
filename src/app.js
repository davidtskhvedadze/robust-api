const express = require('express');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const metricsMiddleware = require('./middleware/metricsMiddleware');
const postRoutes = require('./routes/postRoutes');
const promClient = require('prom-client');

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

module.exports = app;
