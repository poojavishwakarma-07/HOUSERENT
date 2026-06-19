const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(getProperties)
  .post(protect, authorize('owner', 'admin'), upload.array('images', 10), createProperty);

router
  .route('/:id')
  .get(getProperty)
  .put(protect, authorize('owner', 'admin'), upload.array('images', 10), updateProperty)
  .delete(protect, authorize('owner', 'admin'), deleteProperty);

module.exports = router;
