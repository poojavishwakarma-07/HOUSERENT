const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a file to Cloudinary or falls back to local uploads folder
 * @param {string} filePath - Absolute path to local file
 * @returns {Promise<string>} URL of the uploaded image
 */
const uploadImage = async (filePath) => {
  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'rentalhouse',
      });
      // Delete local temporary file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return result.secure_url;
    } else {
      // Local fallback: Return the local public URL path.
      // We will host static uploads at /uploads
      const filename = path.basename(filePath);
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.error('Image upload service error:', error);
    // Even if cloud upload fails, try to return local file path as backup
    const filename = path.basename(filePath);
    return `/uploads/${filename}`;
  }
};

/**
 * Deletes an image from Cloudinary or local disk
 * @param {string} imageUrl - URL of the image
 */
const deleteImage = async (imageUrl) => {
  try {
    if (isCloudinaryConfigured && imageUrl.includes('cloudinary.com')) {
      const publicId = imageUrl
        .split('/')
        .pop()
        .split('.')[0];
      await cloudinary.uploader.destroy(`rentalhouse/${publicId}`);
    } else {
      // Local fallback: Delete from /uploads if it exists
      const filename = imageUrl.split('/').pop();
      const localPath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  } catch (error) {
    console.error('Image deletion service error:', error);
  }
};

module.exports = { uploadImage, deleteImage };
