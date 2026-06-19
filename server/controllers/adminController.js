const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get admin statistics analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
  try {
    // Total numbers
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    // User breakdown
    const tenantsCount = await User.countDocuments({ role: 'tenant' });
    const ownersCount = await User.countDocuments({ role: 'owner' });
    const adminsCount = await User.countDocuments({ role: 'admin' });

    // Property breakdown
    const availableProperties = await Property.countDocuments({ status: 'available' });
    const rentedProperties = await Property.countDocuments({ status: 'rented' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });

    // Booking breakdown
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });

    // Total potential rent transacted
    const bookingsList = await Booking.find({ status: 'approved' }).populate('propertyId');
    const totalRevenue = bookingsList.reduce((acc, booking) => {
      if (booking.propertyId) {
        return acc + booking.propertyId.rent;
      }
      return acc;
    }, 0);

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, tenants: tenantsCount, owners: ownersCount, admins: adminsCount },
        properties: { total: totalProperties, available: availableProperties, rented: rentedProperties, pending: pendingProperties },
        bookings: { total: totalBookings, pending: pendingBookings, approved: approvedBookings, rejected: rejectedBookings },
        reviews: { total: totalReviews },
        revenue: totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent blocking oneself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block your own admin account',
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Property listing approval/status
// @route   PUT /api/admin/properties/:id/status
// @access  Private (Admin)
exports.changePropertyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['available', 'rented', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid property status: available, rented, or pending',
      });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};
