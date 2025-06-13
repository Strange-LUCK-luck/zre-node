// app.js
require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const userRoutes = require('./routes/userRoutes');
const { connectDb, sequelize } = require('./config/db'); // 你的 Sequelize 配置
// 引入 Redis 会触发 config/redis.js 中的自动连接
require('./config/redis');

const app = new Koa();

// 连接 MySQL
connectDb();
// 若需自动同步 Sequelize 模型（生产环境慎用 sync({ force: true })），可：
sequelize.sync().then(() => {
    console.log('Sequelize 模型已同步');
}).catch(err => {
    console.error('Sequelize 同步失败', err);
});

app.use(bodyParser());

// 全局错误处理（可选）
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error('全局捕获错误:', err);
        ctx.status = err.status || 500;
        ctx.body = { error: err.message || 'Internal Server Error' };
    }
});

// 挂载路由
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());

// 启动
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
