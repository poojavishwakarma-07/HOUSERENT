const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    rent: {
      type: Number,
      required: [true, 'Please add the monthly rent amount'],
    },
    deposit: {
      type: Number,
      required: [true, 'Please add the security deposit amount'],
    },
    propertyType: {
      type: String,
      required: [true, 'Please specify property type'],
      enum: ['Apartment', 'Villa', 'Independent House', 'PG'],
    },
    bedrooms: {
      type: Number,
      required: [true, 'Please add the number of bedrooms'],
    },
    bathrooms: {
      type: Number,
      required: [true, 'Please add the number of bathrooms'],
    },
    area: {
      type: Number,
      required: [true, 'Please add the carpet area in sq ft'],
    },
    address: {
      type: String,
      required: [true, 'Please add the address'],
    },
    city: {
      type: String,
      required: [true, 'Please add the city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add the state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please add the pincode'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      required: [true, 'Please upload at least one image'],
    },
    locationCoordinates: {
      lat: {
        type: Number,
        default: 12.9716, // Default Bangalore latitude
      },
      lng: {
        type: Number,
        default: 77.5946, // Default Bangalore longitude
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'pending'],
      default: 'available',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate reviews virtual field
propertySchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'propertyId',
  justOne: false,
});

module.exports = mongoose.model('Property', propertySchema);
