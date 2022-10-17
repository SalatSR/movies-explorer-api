const jwt = require('jsonwebtoken');
const AuthError = require('../errors/AuthError');

const { NODE_ENV, JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'SECRET',
    );
  } catch (e) {
    throw next(new AuthError('Авторизуйтесь'));
  }

  req.user = payload;
  next();
};

module.exports = auth;
