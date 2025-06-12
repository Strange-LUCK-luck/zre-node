const { Sequelize } = require('sequelize');

// 初始化 Sequelize 实例
const sequelize = new Sequelize('personal', 'zre_dev', 'Zre@123456', {
    host: '119.23.153.64',
    dialect: 'mysql',
    port: 3306,  // 默认 MySQL 端口，如果使用其他端口需要替换
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
