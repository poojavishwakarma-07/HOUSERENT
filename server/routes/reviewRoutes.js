const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:propertyId', getReviews);
router.post('/', protect, authorize('tenant'), createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
