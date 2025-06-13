// services/userService.js
const { sm2, sm3 } = require('sm-crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Sequelize 模型
const redisClient = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // 格式如 '1h'

// 注册用户
const registerUser = async (username, password) => {
    const encryptedUsername = sm2.doEncrypt(username); // 使用 SM2 加密用户名
    const hashedPassword = sm3(password); // 使用 SM3 对密码哈希

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username: encryptedUsername } });
    if (existingUser) {
        throw new Error('用户名已存在');
    }

    // 创建新用户
    const newUser = await User.create({
        username: encryptedUsername,
        password: hashedPassword,
    });

    return { message: '注册成功' };
};

/**
 * 登录用户并生成 JWT，保存 Redis
 * @param {string} username 原始用户名（明文）
 * @param {string} password 原始密码（明文）
 * @returns {Object} { message, token }
 */
async function loginUser(username, password) {
    if (!username || !password) {
        throw new Error('用户名和密码不能为空');
    }
    // SM2 加密用户名，与 DB 存储一致
    const encryptedUsername = sm2.doEncrypt(username);
    // SM3 哈希密码
    const hashedPassword = sm3(password);

    // 查询用户
    const user = await User.findOne({ where: { username: encryptedUsername } });
    if (!user) {
        throw new Error('用户不存在');
    }
    if (hashedPassword !== user.password) {
        throw new Error('密码错误');
    }
    // 生成 JWT，payload 可包含用户 ID，若有其它需在 token 中携带的字段也可放，但注意不要放敏感信息
    const payload = { id: user.id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 计算 token 在 Redis 中的 TTL（秒）
    // jwt.sign 生成的 token 自带 exp 字段，可通过 jwt.decode 取出 exp
    const decoded = jwt.decode(token);
    // decoded.exp 是 Unix 时间戳（秒），Date.now() /1000 也是秒
    const nowSec = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - nowSec;
    if (ttl <= 0) {
        throw new Error('生成令牌失败：过期时间不合法');
    }
    // 存 Redis: key = token:<token>，value = userId，设置过期时间与 JWT 一致
    try {
        await redisClient.set(`token:${token}`, String(user.id), { EX: ttl });
    } catch (err) {
        console.error('Redis 写入失败', err);
        throw new Error('服务器内部错误');
    }
    return { message: '登录成功', token };
}

module.exports = {
    registerUser,
    loginUser,
};
