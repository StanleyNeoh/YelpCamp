const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;     //for shortcut
const {cloudinary} = require("../cloudinary");


//https://res.cloudinary.com/deb0xrj56/image/upload/w_300/v1622972191/YelpCamp/kr3j3iltjer5rqnmwwcx.jpg
//We need to modify url so cloudinary will give us appropriately sized image
const ImageSchema = new Schema({
    url: String,
    filename: String
})
//.virtual creates fake field 
//  => ImageSchema.thumbnail will run function and return the value
ImageSchema.virtual("thumbnail").get(function(){
    return this.url.replace("/upload","/upload/w_200")
})

const opts = {toJSON: {virtuals:true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],  //Nested schemas
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type:String,
            enum: ["Point"],
            required:true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"   //Name of model to reference from
        }
    ]
}, opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
})

//findByIdAndDelete(id) is a shorthand for findOneAndDelete({ _id: id })
//Hence, target findOneAndDelete
//This is a query middleware
CampgroundSchema.post("findOneAndDelete", async function(doc){    //Cannot use arrow function as "this" is relevant
    console.log("Deleted",doc);     //doc is what is returned by findOneAndDelete
    if(doc){
        await Review.deleteMany({_id: {$in: doc.reviews}});
        for(let file of doc.images){
            await cloudinary.uploader.destroy(file.filename);
        }
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema);   //module.export is what is received on required call