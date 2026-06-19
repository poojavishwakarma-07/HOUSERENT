const Favorite = require('../models/Favorite');
const Property = require('../models/Property');

// @desc    Get current tenant's favorites
// @route   GET /api/favorites
// @access  Private (Tenant)
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ tenantId: req.user.id })
      .populate({
        path: 'propertyId',
        populate: { path: 'ownerId', select: 'name email phone' },
      });

    // Make sure we only return active properties that exist
    const filteredFavorites = favorites.filter((fav) => fav.propertyId !== null);

    res.status(200).json({
      success: true,
      count: filteredFavorites.length,
      data: filteredFavorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add property to favorites
// @route   POST /api/favorites
// @access  Private (Tenant)
exports.addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if already in favorites
    const isFavorite = await Favorite.findOne({
      tenantId: req.user.id,
      propertyId,
    });

    if (isFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Property is already in your wishlist',
      });
    }

    const favorite = await Favorite.create({
      tenantId: req.user.id,
      propertyId,
    });

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:id (can be propertyId or favoriteId)
// @access  Private (Tenant)
exports.removeFavorite = async (req, res, next) => {
  try {
    // Check if the id provided is a Favorite ID or a Property ID
    let favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      // Try searching by propertyId and tenantId combo
      favorite = await Favorite.findOne({
        tenantId: req.user.id,
        propertyId: req.params.id,
      });
    }

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist entry not found',
      });
    }

    // Check ownership
    if (favorite.tenantId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this wishlist',
      });
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};
