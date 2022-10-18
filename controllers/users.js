const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/ValidationError');
const AuthError = require('../errors/AuthError');
const NotFoundError = require('../errors/NotFoundError');
const DuplicateError = require('../errors/DuplicateError');

const { NODE_ENV, JWT_SECRET } = process.env;

/** Создаёт пользователя */
const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hashedPassword) => {
      User.create({
        name,
        email,
        password: hashedPassword,
      })
        .then((user) => res.send({
          name: user.name,
          email: user.email,
        }))
        .catch((e) => {
          if (e.name === 'MongoServerError' || e.code === 11000) {
            next(new DuplicateError('Пользователь с таким email уже существует'));
          } else if (e.name === 'ValidationError' || e.name === 'CastError') {
            next(new ValidationError('Переданы некорректные данные при cоздании пользователя'));
          } else {
            next(e);
          }
        });
    })
    .catch(next);
};

/** Обновляет профиль */
const patchUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
    },
    {
      new: true, // в then попадет обновленная запись
      runValidators: true, // валидация данных перед изменением
    },
  )
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((data) => res.send(data))
    .catch((e) => {
      if (e.name === 'MongoServerError' || e.code === 11000) {
        next(new DuplicateError('Пользователь с таким email уже существует'));
      } else if (e.name === 'ValidationError' || e.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(e);
      }
    });
};

/** Возвращает информацию о текущем пользователе */
const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((user) => res.send(user))
    .catch((e) => {
      if (e.name === 'CastError') {
        throw new ValidationError('Передан некорректный ID пользователя');
      } else {
        next(e);
      }
    });
};

/** Авторизуем пользователя */
const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .orFail(() => new AuthError('Неправильная почта или пароль+'))
    .then((user) => (
      bcrypt.compare(password, user.password)
        .then((isUserValid) => {
          if (isUserValid) {
            const token = jwt.sign(
              { _id: user._id },
              NODE_ENV === 'production' ? JWT_SECRET : 'SECRET',
            );
            res.cookie('jwt', token, {
              maxAge: 3600000,
              httpOnly: true,
              sameSite: true,
            });
            res.send(user);
          } else {
            next(new AuthError('Неправильная почта или пароль'));
          }
        })
    ))
    .catch(next);
};

module.exports = {
  createUser,
  patchUserInfo,
  getUserInfo,
  login,
};
