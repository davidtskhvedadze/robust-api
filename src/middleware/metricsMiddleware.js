const promClient = require('prom-client');

const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.2, 0.5, 1, 1.5, 2, 5]
});

const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : 'unknown', status_code: res.statusCode });
  });
  next();
};

module.exports = metricsMiddleware;
