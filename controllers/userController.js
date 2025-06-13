const userService = require('../services/userService');
const redisClient = require('../config/redis');
const { sm2 } = require('sm-crypto');
// 注册用户
const registerUser = async (ctx) => {
    const { username, password } = ctx.request.body;

    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { error: '用户名和密码不能为空' };
        return;
    }

    try {
        const result = await userService.registerUser(username, password);
        ctx.status = 201;
        ctx.body = result;
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

// 登录用户
const loginUser = async (ctx) => {
    const { username, password } = ctx.request.body;
    try {
        const result = await userService.loginUser(username, password);
        ctx.body = result; // { message: '登录成功', token: '...' }
    } catch (err) {
        ctx.status = 400;
        ctx.body = { error: err.message };
    }
};
const logout = async (ctx) => {
    const token = ctx.state.token;
    if (!token) {
        ctx.status = 400;
        ctx.body = { error: '缺少令牌' };
        return;
    }
    try {
        await redisClient.del(`token:${token}`);
        ctx.body = { message: '已成功注销' };
    } catch (err) {
        console.error('Redis 删除失败', err);
        ctx.status = 500;
        ctx.body = { error: '服务器内部错误' };
    }
};
/**
 * 获取当前登录用户详情
 * GET /user/detail
 */
const getUserDetail = async (ctx) => {
    const userId = ctx.state.user.id;
    try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', /* 如有 email, createdAt 等字段，也可加*/],
        });
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: '用户不存在' };
            return;
        }
        // 若 username 在 DB 中是 SM2.doEncrypt 存储的，需要解密再返回
        let decryptedUsername;
        try {
            decryptedUsername = sm2.doDecrypt(user.username);
        } catch (e) {
            console.warn('用户名解密失败', e);
            decryptedUsername = null;
        }
        // 根据需要返回其它字段，注意不要返回 password 字段
        ctx.body = {
            id: user.id,
            username: decryptedUsername,
            // email: user.email,
            // createdAt: user.createdAt,
            // ... 其它可公开的字段
        };
    } catch (err) {
        console.error('查询用户详情失败', err);
        ctx.status = 500;
        ctx.body = { error: '服务器内部错误' };
    }
};

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUserDetail
};
