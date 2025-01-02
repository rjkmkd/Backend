import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongooseAggregatePaginate";

const tweetSchema = new mongoose.Schema(
    {
        content:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{
        timestamps:true
    }
)

tweetSchema.plugin(mongooseAggregatePaginate)
export const Tweet = mongoose.model('Tweet',tweetSchema)