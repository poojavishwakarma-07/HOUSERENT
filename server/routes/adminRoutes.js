const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  toggleBlockUser,
  changePropertyStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);
router.put('/properties/:id/status', changePropertyStatus);

module.exports = router;
