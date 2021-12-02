const Joi = require("joi");     //npm package for error handling schemas

module.exports.campgroundSchema = Joi.object({
    //Acts as a reference to check campground against
    //Then triggers appropriate errors
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        //No author as that is added in later
        //No image is extracted by multer and put into req.file
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})