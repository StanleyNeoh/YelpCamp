const express= require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware");
const Campground = require("../models/campground.js");
const campground = require("../controllers/campgrounds");

const multer = require("multer");   //for handling of multipart/formdata
const {storage} = require("../cloudinary"); //automatically looks for index.js in folder
const upload = multer({storage})   //destination to upload to is cloudinary


//upload middleware will put uploaded file into destination folder
    //  upload.single for single file   => file will be in req.file
    //  upload.array for multiple file  => file will be in req.files
//With cloudinary, now req.file has a "path" field to access the img online on cloudinary

router.route("/")
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array("image"), validateCampground,  catchAsync(campground.createCampground));

router.get("/new", isLoggedIn, campground.renderNewForm);

router.route("/:id")
    .get(catchAsync(campground.showCampground))
    .put(isLoggedIn, isAuthor, upload.array("image"),validateCampground, catchAsync(campground.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground));

router.get("/:id/edit",isLoggedIn, isAuthor, catchAsync(campground.renderEditForm));

module.exports = router;