const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.connect().catch(console.error);

const cacheMiddleware = async (req, res, next) => {
    const key = req.originalUrl;
    try {
        const cachedResponse = await redisClient.get(key);
        if (cachedResponse) {
            return res.json(JSON.parse(cachedResponse));
        }
    } catch (err) {
        console.error('Error fetching from Redis', err);
    }
    res.sendResponse = res.json;
    res.json = (body) => {
        redisClient.setEx(key, 100, JSON.stringify(body)); 
        res.sendResponse(body);
    };
    next();
};

module.exports = cacheMiddleware;
