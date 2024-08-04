const { createClient } = require('redis');
const logger = require('../utils/logger');
const config = require('../utils/config');

// Create a Redis client with the specified configuration
const redisClient = createClient({
    password: config.REDIS_PASSWORD,
    socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT
    }
});

// Connect to the Redis server and log any connection errors
redisClient.connect().catch(logger.error);

// Middleware function to handle caching
const cacheMiddleware = async (req, res, next) => {
    // Use the request's original URL as the cache key
    const key = req.originalUrl;
    try {
        // Attempt to fetch the cached response from Redis
        const cachedResponse = await redisClient.get(key);
        if (cachedResponse) {
            // If a cached response is found, parse it and send it as the response
            return res.json(JSON.parse(cachedResponse));
        }
    } catch (err) {
        // Log any errors that occur while fetching from Redis
        logger.error('Error fetching from Redis', err);
    }

    // Store the original res.json function
    res.sendResponse = res.json;

    // Override the res.json function to cache the response
    res.json = (body) => {
        // Cache the response in Redis with an expiration time of 100 seconds
        redisClient.setEx(key, 100, JSON.stringify(body));
        // Send the response to the client
        res.sendResponse(body);
    };

    next();
};

module.exports = cacheMiddleware;