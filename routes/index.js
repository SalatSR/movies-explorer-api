const router = require('express').Router();
const cookieParser = require('cookie-parser');
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const { validateSignIn, validateSignUp } = require('../middlewares/validation');
const { createUser, login } = require('../controllers/users');
const NotFoundError = require('../errors/NotFoundError');

/**
 * создаёт пользователя с переданными в теле
 * email, password и name
 * POST /signup
 *
 * проверяет переданные в теле почту и пароль
 * и возвращает JWT
 * POST /signin
 */
router.post('/signup', validateSignUp, createUser);
router.post('/signin', validateSignIn, login);

router.use(cookieParser());
router.use(auth);

/** Защищённые маршруты */
router.use('/', userRouter);
router.use('/', movieRouter);
router.post('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});

/** Ошибка 404 */
router.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
