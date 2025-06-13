// config/redis.js
const redis = require('redis');

const {
    REDIS_HOST = '127.0.0.1',
    REDIS_PORT = 6379,
    REDIS_PASSWORD = ''
} = process.env;

const client = redis.createClient({
    socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
    },
    password: REDIS_PASSWORD || undefined,
});

// 连接、错误事件处理
client.on('error', (err) => {
    console.error('Redis Client Error', err);
});
(async () => {
    try {
        await client.connect();
        console.log('Redis 已连接');
    } catch (err) {
        console.error('Redis 连接失败', err);
    }
})();

module.exports = client;
