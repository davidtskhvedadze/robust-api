const morgan = require('morgan');

// The 'combined' format includes detailed information about each HTTP request
const loggingMiddleware = morgan('combined');

module.exports = loggingMiddleware;