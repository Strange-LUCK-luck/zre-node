const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const userRoutes = require('./routes/userRoutes');
const { connectDb } = require('./config/db');

const app = new Koa();

// 连接数据库
connectDb();

// 使用中间件：解析请求体
app.use(bodyParser());

// 路由配置
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());

// 启动服务
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
