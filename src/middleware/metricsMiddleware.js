const promClient = require('prom-client');

// Collect default metrics
promClient.collectDefaultMetrics({ timeout: 5000 });

// Histogram to measure request durations
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.2, 0.5, 1, 1.5, 2, 5]
});

// Counter to measure total requests
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Histogram to measure request sizes
const httpRequestSizeBytes = new promClient.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route']
});

// Histogram to measure response sizes
const httpResponseSizeBytes = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route']
});

const metricsMiddleware = (req, res, next) => {
  // Start the timer to measure the duration of the HTTP request
  const end = httpRequestDurationMicroseconds.startTimer();

  // Record the size of the incoming request
  const requestSize = parseInt(req.headers['content-length']) || 0;
  httpRequestSizeBytes.observe({ method: req.method, route: req.route ? req.route.path : 'unknown' }, requestSize);

  // When the response is finished, record the size of the response and stop the timer
  res.on('finish', () => {
    // Record the size of the outgoing response
    const responseSize = parseInt(res.getHeader('Content-Length')) || 0;
    httpResponseSizeBytes.observe({ method: req.method, route: req.route ? req.route.path : 'unknown' }, responseSize);

    // Increment the counter for total requests and record the duration of the request
    httpRequestsTotal.inc({ method: req.method, route: req.route ? req.route.path : 'unknown', status_code: res.statusCode });
    end({ method: req.method, route: req.route ? req.route.path : 'unknown', status_code: res.statusCode });
  });

  next();
};

module.exports = metricsMiddleware;