const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('tenant'));

router.route('/').get(getFavorites).post(addFavorite);
router.route('/:id').delete(removeFavorite);

module.exports = router;
