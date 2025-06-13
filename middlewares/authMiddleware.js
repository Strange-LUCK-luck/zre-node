// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

module.exports = async (ctx, next) => {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.status = 401;
        ctx.body = { error: '未提供有效的授权令牌' };
        return;
    }
    const token = authHeader.slice(7).trim(); // Bearer 后面的 token
    let payload;
    try {
        // 验证签名和过期。若过期，此处会抛异常
        payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        ctx.status = 401;
        ctx.body = { error: '无效或已过期的令牌' };
        return;
    }
    // payload 中预计包含 { id: userId, ... }，根据登录时生成的 payload 而定
    const userId = payload.id;
    if (!userId) {
        ctx.status = 401;
        ctx.body = { error: '令牌不包含用户信息' };
        return;
    }
    // 到 Redis 检查 token 是否存在且对应 userId
    try {
        const storedUserId = await redisClient.get(`token:${token}`);
        if (!storedUserId || storedUserId !== String(userId)) {
            ctx.status = 401;
            ctx.body = { error: '登录已失效或已登出' };
            return;
        }
    } catch (err) {
        console.error('Redis 查询失败', err);
        ctx.status = 500;
        ctx.body = { error: '服务器内部错误' };
        return;
    }
    // 鉴权通过，保存 info 供后续使用
    ctx.state.user = { id: userId };
    ctx.state.token = token;
    await next();
};
