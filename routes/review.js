const express=require("express");
const router = express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpresError=require("../utils/ExpressError.js")
//const{listingSchema,reviewSchema}=require("../schema.js")
const{reviewSchema}=require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");  // Corrected path
const {isLoggedIn,validateReview, isReviewAuthor}=require("../middileware.js");

const reviewController=require("../controllers/reviews.js");






//post-review route
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview));  
  
  //delete review route
  router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
  );

        module.exports=router;
  