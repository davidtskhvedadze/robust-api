require('dotenv').config()

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
const REDIS_PASSWORD = process.env.REDIS_PASSWORD
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT


module.exports = {
    PORT,
    DATABASE_URL,
    REDIS_PASSWORD,
    REDIS_HOST,
    REDIS_PORT
}