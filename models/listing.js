const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image:{
        url:String,
        filename:String,
    }, 
    price:Number,
    // location: {
    //     type: String,
    //     required: [true, 'Location is required'],
    //     validate: {
    //       validator: function(value) {
    //         return value.trim().length > 0; // Empty string ko reject karega
    //       },
    //       message: 'Location cannot be empty'
    //     }
    //   },
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
 owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
 }
}); 

//middileware for delete reviews id from listing document
listingSchema.post("findOneAndDelete",async (listing) => {
    if(listing){
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
}
)
const Listing=mongoose.model("Listing",listingSchema);
module.exports = Listing;