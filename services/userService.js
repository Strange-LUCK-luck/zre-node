const { sm2, sm3 } = require('sm-crypto');
const User = require('../models/userModel');

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

// 登录用户
const loginUser = async (username, password) => {
    const encryptedUsername = sm2.doEncrypt(username); // 使用 SM2 加密用户名
    const hashedPassword = sm3(password); // 使用 SM3 对密码哈希

    // 查找用户
    const user = await User.findOne({ where: { username: encryptedUsername } });
    if (!user) {
        throw new Error('用户不存在');
    }

    // 检查密码是否正确
    if (hashedPassword !== user.password) {
        throw new Error('密码错误');
    }

    return { message: '登录成功' };
};

module.exports = {
    registerUser,
    loginUser,
};
