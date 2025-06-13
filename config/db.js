const { Sequelize } = require('sequelize');
const {
    DB_HOST = '119.23.153.64',
    DB_USER = 'zre_dev',
    DB_PASSWORD = 'Zre@123456',
    DB_NAME = 'personal',
    DB_PORT = 3306
} = process.env
// 初始化 Sequelize 实例
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    port: DB_PORT,  // 默认 MySQL 端口，如果使用其他端口需要替换
    logging: false,  // 禁用日志输出
});

const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
    }
};

module.exports = {
    sequelize,
    connectDb,
};
