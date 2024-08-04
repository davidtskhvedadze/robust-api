const { createClient } = require('redis');
const logger = require('./logger');
const config = require('../utils/config');

const redisClient = createClient({
    password: config.REDIS_PASSWORD,
    socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT
    }
});

redisClient.connect().catch(logger.error);

const cacheMiddleware = async (req, res, next) => {
    const key = req.originalUrl;
    try {
        const cachedResponse = await redisClient.get(key);
        if (cachedResponse) {
            return res.json(JSON.parse(cachedResponse));
        }
    } catch (err) {
        logger.error('Error fetching from Redis', err);
    }
    res.sendResponse = res.json;
    res.json = (body) => {
        redisClient.setEx(key, 100, JSON.stringify(body)); 
        res.sendResponse(body);
    };
    next();
};

module.exports = cacheMiddleware;
