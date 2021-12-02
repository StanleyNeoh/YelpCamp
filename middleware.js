const {campgroundSchema ,reviewSchema} = require("./Schemas");   //Uses joi package
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next)=>{
    //console.log("req.user:", req.user);     
    if(!req.isAuthenticated()){//method from passport
        //console.log(`You are at ${req.path} and came from ${req.originalUrl}`);
        req.session.returnTo = req.originalUrl;     //returnTo is our own added field
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.validateCampground = (req,res,next)=>{        //Middleware to validate campground
    //console.log(req.body);
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
}

module.exports.isAuthor = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req,res,next)=>{
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}