if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
} 

 


const express = require("express");
const app = express();
const mongoose = require("mongoose");
 
const path =require("path");
const methodOverride=require("method-override")
const ejsMate = require("ejs-mate");

const ExpresError=require("./utils/ExpressError.js")
const session =require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const passport =require("passport");
const LocalStrategy=require("passport-local");
const User = require("./models/user.js");
const dbUrl=process.env.ATLASDB_URL;

main().then(() => {
  console.log("connected to DB");
}).catch((err) => {
  console.log(err);
});

async function main() {
  await mongoose.connect(dbUrl);
} 

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views" ));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs",ejsMate); 

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },  
touchAfter:24*3600,
});
 
store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
  
})

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    exppires:Date.now()+ 7*24*60*60*1000,// aaj ke 7 days bad expire hoga
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
};

// app.get("/", (req, res) => {
//   res.send("hi i am root !");
// });




app.use( session(sessionOptions));
app.use(flash());
//passport implemnt k liye session ki need pdti hai
//ek session k andr user k login credentials common rhenge 
//so passport session ko use krta hai isliye uske bad implement kr rhe 
app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());//user se related sare info 
//session me store krna serialize hai ex- jaise user ne log in kr liya to session me uska info store ho gya 

passport.deserializeUser(User.deserializeUser());//iska mtlb hai session se user ki info ko remove krna hai
//jaise user ne jb logout kr liya hai

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  //console.log( res.locals.success);
  res.locals.currUser=req.user;
  next();
});

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"student1@gmail.com",
//     username:"alpha-student"
//   });
 
//                            // register method db me fakeuser 
//                            //ko helloworld password k sath save kra dega

// let registeredUser=await User.register(fakeUser,"helloworld");
// res.send(registeredUser);
// })


 
 




 




  app.use("/listings",listingRouter);
  app.use("/listings/:id/reviews",reviewRouter);
  app.use("/",userRouter) ;
  app.use("/",(req,res)=>{
    res.redirect("/listings");
  })
  //reviews route
  // for post the reviews
//   app.post("/listings/:id/reviews", async (req, res) => {
//     try {
//         let listing = await Listing.findById(req.params.id);
//         if (!listing) {
//             return res.status(404).send("Listing not found");
//         }

//         let newReview = new Review(req.body.review);
//         listing.reviews.push(newReview);
//         await newReview.save();
//         await listing.save();

//         console.log("new review saved");
//         res.send("new review saved");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("An error occurred while saving the review.");
//     }
// });



 
  

// app.get("/testListing", async (req, res) => {
//     try {
//       let sampleListing = new Listing({
//         title: "my new villa..",
//         description: "by the beach..",
//         price: 1200,
//         location: "calangute, goa",
//         country: "India",
//       });
      
//       await sampleListing.save();
//       console.log("sample was saved");
//       res.send("successful testing");
//     } catch (error) {
//       console.error("Error saving sample listing:", error);
//       res.status(500).send("Error saving sample listing");
//     }
//   });
 

  app.all("*",(req,res,next)=>{
    next(new ExpresError(404,"page not found"));
  });

  app.use((err, req, res, next) => {
    let {statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{err})
   //res.status(statusCode).send(message);
  });
  
 
  
app.listen(8080, () => {
    console.log("app is listening at port :", 8080);
  });
   