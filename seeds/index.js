const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers");
const Campground = require("../models/campground.js")

const numToSeed = 15;

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});    //database of yelp-camp

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})

const sample = arr=> arr[Math.floor(Math.random() * arr.length)];


const seedDB = async ()=>{
    await Campground.deleteMany({});    //clears collection
    for(let i = 0; i<numToSeed; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) +10;
        const camp = new Campground({
            author: "60ba0e2d48cda4182cbd2b61",     //id of a particular user
            location: `${cities[random1000].city} ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio, ut magni in, tempore perferendis, alias laudantium sunt repudiandae minima quasi ullam dicta quisquam veritatis! Excepturi ut modi error alias consectetur!",
            price,
            geometry: {
                type:"Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: []
        })
        await camp.save();
    }
    console.log("Done seeding");
}
seedDB().then(()=>{
    mongoose.connection.close();
})