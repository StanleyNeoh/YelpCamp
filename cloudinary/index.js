const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({     //Setting up instance of cloudinary storage
    cloudinary,
    params:{
        folder: "YelpCamp",                     //Name of folder in cloudinary to store things in
        allowedFormats: ["jpeg", "png", "jpg"]
    }
})

module.exports = {cloudinary, storage}