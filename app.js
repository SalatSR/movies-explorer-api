const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes');
const { requireLogger, errorLogger } = require('./middlewares/logger');
const errorsCentral = require('./errors/errorsCentral');

dotenv.config();
const { NODE_ENV, DATABASE_URL, PORT = 3000 } = process.env;

/** Настроки CORS параметров (разрешены адреса и куки) */
const allowedCors = {
  origin: [
    'https://salatsr-movies.nomoredomains.icu',
    'http://salatsr-movies.nomoredomains.icu',
    'http://localhost:3001',
    'https://localhost:3001',
  ],
  credentials: true,
};

const app = express();

/** подключаемся к серверу mongo */
mongoose.connect(NODE_ENV === 'production' ? DATABASE_URL : 'mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: false,
});

/** Проверяем CORS параметры запросов */
app.use(cors(allowedCors));

/** Конвертируем запросы в формат json */
app.use(express.json());

/** Логгер запросов */
app.use(requireLogger);

/** Тест на автозапуск Node.js */
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

/** Маршруты */
app.use(routes);

/** Логгер ошибок */
app.use(errorLogger);

/** Обработка ошибок */

/** Ошибки celebrate */
app.use(errors());

/** Централизованнный обработчик ошибок */
app.use(errorsCentral);

app.listen(PORT);
