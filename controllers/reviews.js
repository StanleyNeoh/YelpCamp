const Review = require("../models/review");
const Campground = require("../models/campground.js");

module.exports.createReview = async (req,res)=>{
    const campground = await Campground.findById(req.params.id);    
    //Router likes to keep params seperate, use {mergeParams:true} in router instantiation
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "New review added")
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req,res)=>{
    //Routing contains both campground ID and review ID bcos we want to remove from both
    const {id, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
}