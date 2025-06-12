const userService = require('../services/userService');

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

    if (!username || !password) {
        ctx.status = 400;
        ctx.body = { error: '用户名和密码不能为空' };
        return;
    }

    try {
        const result = await userService.loginUser(username, password);
        ctx.body = result;
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

module.exports = {
    registerUser,
    loginUser,
};
