import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema = new mongoose.Schema(
    {
        videoFile:{
            typr:String,
            required:true
        },
        thumbnail:{
            typr:String,
            required:true
        },
        title:{
            typr:String,
            required:true
        },
        description:{
            typr:String,
            required:true
        },
        duration:{
            typr:Number,
            required:true
        },
        views:{
            typr:Number,
            default:0
        },
        isPublised:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)