const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dowsgqeyn',  // Replace with your Cloudinary cloud name
  api_key: '386559293685397',        // Replace with your Cloudinary API key
  api_secret: '5rKP8hbSk05WR4aKnN4bAyR2cis'   // Replace with your Cloudinary API secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'tasks', // The folder where files will be saved in Cloudinary
  allowedFormats: ['jpg', 'png', 'jpeg'],
});

module.exports = { cloudinary, storage };
