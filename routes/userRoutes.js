const Router = require('koa-router');
const userController = require('../controllers/userController');

const router = new Router();

// 注册路由
router.post('/register', userController.registerUser);

// 登录路由
router.post('/login', userController.loginUser);

module.exports = router;
