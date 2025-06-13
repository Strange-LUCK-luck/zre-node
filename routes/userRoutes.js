const Router = require('koa-router');

const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = new Router();

// 注册 & 登录 路由（公开）
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// 需要鉴权的路由
router.get('/user/detail', authMiddleware, userController.getUserDetail);
router.post('/logout', authMiddleware, userController.logout);

module.exports = router;
