const router = require('express').Router();
const { validateUserInfo } = require('../middlewares/validation');
const {
  getUserInfo,
  patchUserInfo,
} = require('../controllers/users');

/**
 * возвращает информацию о пользователе (email и имя)
 * GET /users/me
 *
 * обновляет информацию о пользователе (email и имя)
 * PATCH /users/me — обновляет профиль
 */

router.get('/users/me', getUserInfo);
router.patch('/users/me', validateUserInfo, patchUserInfo);

module.exports = router;
