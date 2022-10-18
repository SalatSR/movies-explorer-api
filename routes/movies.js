const router = require('express').Router();
const {
  validateMovie,
  validateMovieId,
} = require('../middlewares/validation');
const {
  getMovies,
  createMovie,
  deletMovieById,
} = require('../controllers/movies');

/**
 * возвращает все сохранённые текущим  пользователем фильмы
 * GET /movies
 *
 * создаёт фильм с переданными в теле country, director, duration,
 * year, description, image, trailer, nameRU, nameEN и thumbnail, movieId
 * POST /movies
 *
 * удаляет карточку по идентификатору
 * DELETE /movies/:movieId
 */

router.get('/movies', getMovies);
router.post('/movies', validateMovie, createMovie);
router.delete('/movies/:movieId', validateMovieId, deletMovieById);

module.exports = router;
