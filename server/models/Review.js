const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: [true, 'Please add some review content'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per property per user
reviewSchema.index({ propertyId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
