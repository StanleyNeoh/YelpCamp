if(process.env.NODE_ENV !== "production"){
    //process.env.NODE_ENV is usually "development" or "production"
    //Currently in development but when deployed will run in production
    //So when we are not in production, it will use the .env file
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");        //npm package for defining boilerplate layouts in ejs
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local")

//Written dependencies
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");

//Routers
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");


mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});    //database of yelp-camp

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
})
const app = express();
const port = 3000;

app.engine("ejs", ejsMate);     //tells express use ejsMate instead of the default
app.set("view engine", "ejs");  //will require ejs on express side (ejs is installed in nodemodule tho)
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));   //to enable reading of req.body from post
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")))   //Static Assets will be searched in public folder
const sessionConfig = {
    secret: "ThisIsTheSecretKeyUsedForValidating",
    resave: false,
    saveUninitialized: true,
    cookies: {
        httpOnly: true,     
        //HttpOnly 
        //  => if true, cookie cannot be accessed through client side script. Will not reveal cookie to third party
        //Time is in milliseconds
        expires: Date.now() + 1000*60*60*24*7,  
        maxAge: 1000*60*60*24*7 
    }
}
app.use(session(sessionConfig));    //Will now have cookie stays till cookies cleared/expires
app.use(flash());                   //Allow for data to be passed on redirect



app.use(passport.initialize());     //required to initialize passport
app.use(passport.session());        //required for persistent login sessions(so dont have to keep relogging)
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());   //This tells User how to serialize
passport.deserializeUser(User.deserializeUser());   //This tells User how to deserialize
app.use((req,res,next)=>{
    //console.log(req.session.returnTo)
    res.locals.currentUser = req.user;      //So every ejs will have user login info
    res.locals.success = req.flash("success");      //Middleware to make flash data accessible to all ejs files
    res.locals.error = req.flash("error");
    next();
})
//req.user is a method by passport 
    //  => returns undef when not logged in, 
    //  => returns userData when logged in


//Routers below
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);   //wouldnt pick up the id param from router unless {mergeParams: true}
app.use("/", userRoutes);

app.get('/', (req,res)=>{
    res.render("home");
})

app.all("*", (req, res,next)=>{
    next(new ExpressError("Page Not Found", 404));
})

//Error-handling below
app.use((err, req, res, next)=>{
    const {status=500} = err;
    if(!err.message){
        err.message = "Oh No Something Went Wrong!"
    }
    res.status(status).render("error", {err});
})

app.listen(port, ()=>{
    console.log(`Serving on port ${port}`);
})

