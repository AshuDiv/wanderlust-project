const ExpresError=require("./utils/ExpressError.js")
const{listingSchema,reviewSchema}=require("./schema.js")
const Listing=require("./models/listing.js");
const Review=require("./models/review.js");



module.exports.isLoggedIn=(req,res,next)=>{
   //console.log(req.session);
   //console.log(req.originalUrl);
    if(!req.isAuthenticated()){
        //console.log(req.user);
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
       return res.redirect("/login");
      }
      next();
}


module.exports.saveRedirectUrl=(req,res,next)=>{
    if (req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

// res.locals ek object hai jo Express.js mein har request ke liye unique hota hai.
//  Isme aap data ko set kar sakte hain jo us particular request ke liye accessible hota hai.
// Aap isme values set kar sakte hain, aur yeh values us request ke lifecycle mein access kiya ja sakta hai,
//  jaise ki middleware ya route handlers mein.


module.exports.isOwner= async (req,res,next)=>{
  let { id } = req.params;
  let listing= await Listing.findById(id);
 // await Listing.findByIdAndUpdate(id, { ...req.body.listing });//, { runValidators: true, new: true }
 if(!listing.owner.equals(res.locals.currUser._id)){
  req.flash("error","you are not the owner of this listing");
 return res.redirect(`/listings/${id}`);
 }
 next();
}
 module.exports.validateListing=(req,res,next)=>{
    let{error} = listingSchema.validate(req.body);
   // console.log(result);
  
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpresError(400,errMsg);
    }else{
      next();
    }
  
  }

  module.exports.validateReview=(req,res,next)=>{
    let{error} = reviewSchema.validate(req.body);
   // console.log(result);
  
    if(error){
      let errMsg=error.details.map((el)=>el.message).join(",");
      throw new ExpresError(400,errMsg);
    }else{
      next();
    }
  
  }


  module.exports.isReviewAuthor= async (req,res,next)=>{
    let { id,reviewId } = req.params;
    let review= await Review.findById(reviewId);
   // await Listing.findByIdAndUpdate(id, { ...req.body.listing });//, { runValidators: true, new: true }
   if(!review.author._id.equals(res.locals.currUser._id)){
    req.flash("error","you are not the author of this review");
   return res.redirect(`/listings/${id}`);
   }
   next();
}