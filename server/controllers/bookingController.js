const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { sendBookingNotification, sendInquiryNotification } = require('../services/emailService');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let bookings;

    if (req.user.role === 'admin') {
      bookings = await Booking.find()
        .populate('tenantId', 'name email phone')
        .populate({
          path: 'propertyId',
          populate: { path: 'ownerId', select: 'name email phone' },
        });
    } else if (req.user.role === 'owner') {
      // Find all properties owned by this user
      const properties = await Property.find({ ownerId: req.user.id });
      const propertyIds = properties.map((p) => p._id);

      // Find bookings for these properties
      bookings = await Booking.find({ propertyId: { $in: propertyIds } })
        .populate('tenantId', 'name email phone')
        .populate('propertyId');
    } else {
      // Tenant: find bookings created by this user
      bookings = await Booking.find({ tenantId: req.user.id })
        .populate({
          path: 'propertyId',
          populate: { path: 'ownerId', select: 'name email phone' },
        });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a booking request
// @route   POST /api/bookings
// @access  Private (Tenant)
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, message } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId).populate('ownerId');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (property.status === 'rented') {
      return res.status(400).json({
        success: false,
        message: 'Property is already rented',
      });
    }

    // Check if tenant already requested this property and request is pending or approved
    const existingBooking = await Booking.findOne({
      tenantId: req.user.id,
      propertyId,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a pending or active booking request for this property',
      });
    }

    // Create booking
    const booking = await Booking.create({
      tenantId: req.user.id,
      propertyId,
      message,
    });

    // Send email notification to owner
    sendInquiryNotification(property.ownerId, req.user, property, message);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Approve / Reject)
// @route   PUT /api/bookings/:id
// @access  Private (Owner, Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: approved, rejected, or pending',
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('tenantId')
      .populate('propertyId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found',
      });
    }

    const property = booking.propertyId;

    // Verify ownership
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to manage bookings for this property',
      });
    }

    booking.status = status;
    await booking.save();

    // If booking is approved, update property status to rented
    if (status === 'approved') {
      property.status = 'rented';
      await property.save();

      // Reject all other pending bookings for the same property
      await Booking.updateMany(
        { propertyId: property._id, _id: { $ne: booking._id }, status: 'pending' },
        { status: 'rejected' }
      );
    } else if (status === 'rejected' && property.status === 'rented') {
      // If booking was approved previously and now rejected, revert property status to available
      property.status = 'available';
      await property.save();
    }

    // Send status update notification to tenant
    sendBookingNotification(booking, booking.tenantId, property, status);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
