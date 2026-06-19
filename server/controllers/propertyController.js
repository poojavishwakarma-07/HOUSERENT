const Property = require('../models/Property');
const Review = require('../models/Review');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

// @desc    Get all properties with filtering, search, sorting & pagination
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Parsing filtering query
    let queryObj = JSON.parse(queryStr);

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { address: searchRegex },
      ];
    }

    // Advanced range logic for rent/deposit
    if (req.query.minRent || req.query.maxRent) {
      queryObj.rent = {};
      if (req.query.minRent) queryObj.rent.$gte = Number(req.query.minRent);
      if (req.query.maxRent) queryObj.rent.$lte = Number(req.query.maxRent);
    }

    // Filter by property status (always default to available unless owner/admin details)
    if (!queryObj.status) {
      queryObj.status = 'available';
    }

    // Build the query execution
    query = Property.find(queryObj);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Property.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const properties = await query.populate('ownerId', 'name email phone profileImage');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    // Fetch averages ratings for each property manually since they are not stored in Property model directly
    const propertiesWithRatings = await Promise.all(
      properties.map(async (property) => {
        const reviews = await Review.find({ propertyId: property._id });
        const avgRating =
          reviews.length > 0
            ? Number(
                (
                  reviews.reduce((acc, rev) => acc + rev.rating, 0) /
                  reviews.length
                ).toFixed(1)
              )
            : 0;
        
        return {
          ...property.toObject(),
          rating: avgRating,
          reviewsCount: reviews.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: propertiesWithRatings.length,
      total,
      pagination,
      data: propertiesWithRatings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId', 'name email phone profileImage')
      .populate({
        path: 'reviews',
        populate: {
          path: 'tenantId',
          select: 'name profileImage',
        },
      });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: `Property not found with id ${req.params.id}`,
      });
    }

    // Calculate rating details
    const reviews = await Review.find({ propertyId: property._id });
    const avgRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
            ).toFixed(1)
          )
        : 0;

    const propertyObj = property.toObject();
    propertyObj.rating = avgRating;
    propertyObj.reviewsCount = reviews.length;

    res.status(200).json({
      success: true,
      data: propertyObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner, Admin)
exports.createProperty = async (req, res, next) => {
  try {
    // Add user to req.body as ownerId
    req.body.ownerId = req.user.id;

    // Handle image uploads if present
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file.path);
        imageUrls.push(url);
      }
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image',
      });
    }

    req.body.images = imageUrls;

    // Parse coordinates and amenities if sent as strings (e.g. from FormData)
    if (typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split(',').map((a) => a.trim());
    }
    if (req.body.lat && req.body.lng) {
      req.body.locationCoordinates = {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
      };
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner, Admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: `Property not found with id ${req.params.id}`,
      });
    }

    // Make sure user is owner or admin
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this property`,
      });
    }

    // Handle image uploads if adding new ones
    if (req.files && req.files.length > 0) {
      let newImageUrls = [];
      for (const file of req.files) {
        const url = await uploadImage(file.path);
        newImageUrls.push(url);
      }
      
      // If user uploaded new images, either append or replace them.
      // We will append to existing images by default, or replace if explicitly requested.
      const appendImages = req.body.appendImages === 'true' || req.body.appendImages === true;
      if (appendImages) {
        req.body.images = [...property.images, ...newImageUrls];
      } else {
        // Delete old images
        for (const imgUrl of property.images) {
          await deleteImage(imgUrl);
        }
        req.body.images = newImageUrls;
      }
    }

    // Parse coordinates and amenities if sent as strings (FormData)
    if (typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split(',').map((a) => a.trim());
    }
    if (req.body.lat && req.body.lng) {
      req.body.locationCoordinates = {
        lat: Number(req.body.lat),
        lng: Number(req.body.lng),
      };
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner, Admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: `Property not found with id ${req.params.id}`,
      });
    }

    // Make sure user is owner or admin
    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this property`,
      });
    }

    // Delete property images
    for (const imgUrl of property.images) {
      await deleteImage(imgUrl);
    }

    // Remove reviews linked to this property
    await Review.deleteMany({ propertyId: property._id });

    // Remove actual property from DB
    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
