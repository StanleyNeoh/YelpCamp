const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
//For authentication, we are using passport, passport-local, passport-local-mongoose

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
    //No need to add in Username and password
})

UserSchema.plugin(passportLocalMongoose);
//This will:
//  add on username-password to schema
//  ensure usernames are unique
//  give some additional methods we can use
//  -   Authenticate
//  -   serializeUser   //How we store the user in a session
//  -   deserializeUser     //How we remove user from a session
//  -   register
//  -   findByUsername
//  -   createStrategy


module.exports = mongoose.model("User", UserSchema);