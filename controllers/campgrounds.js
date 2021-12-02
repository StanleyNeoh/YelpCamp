const Campground = require("../models/campground.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");  //Using mapbox package -> geocoding services
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});
const {cloudinary} = require("../cloudinary");

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({});
    //console.log(campgrounds);
    res.render("campgrounds/index", {campgrounds});
}

module.exports.renderNewForm = (req,res)=>{     
    //put before the id so it will try this first before id
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}));        //For multiple files
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", " Successfully Made a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res)=>{
    const { id } = req.params;  
    //if id cant be casted to ObjectID(wrong num of digits) => error will occur at .findById and alert wont show
    const campground = await Campground.findById(id).populate({
        path: "reviews",    //This is to populate author in review (nested populate)
        populate: {
            path: "author"
        }
    }).populate("author");
    //reviews field prior to population is Object IDs of what is referenced(Review)
    //Use .populate to replace object IDs with actual review objects
    if (!campground){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", {campground});
}

module.exports.renderEditForm = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground){
        req.flash("error", "Cannot find that campground");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) //spread operator
    const newImgs = req.files.map(f=>({url: f.path, filename: f.filename}));
    campground.images.push(...newImgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}});
    }
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    //We will delete associated reviews by using a middleware. Look in model
        //Notes: Mongoose have query and document middleware. Each behaves differently
        //       https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndDelete
    req.flash("success", "Successfully deleted campground");
    res.redirect('/campgrounds');
}