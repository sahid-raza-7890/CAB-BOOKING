const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteDriverController');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('User'));

router.route('/')
  .get(getFavorites);

router.route('/:driverId')
  .post(addFavorite)
  .delete(removeFavorite);

module.exports = router;
