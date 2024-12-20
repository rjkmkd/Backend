import mongoose, { Schema } from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  fullName: {
    type: String,
    require: true,
    index: true,
    trim: true,
  },
  password: {
    type: String,
    require: [true, "Password is required"],
  },
  refrechToken: {
    type: String,
    
  },
  avatar: {
    type: String, //cloudinary URL
    require: true,
  },
  coverImage: {
    type: String, //cloudinary URL
  },
  watchHistory: [
    {
        type:Schema.Types.ObjectId,
        ref:'Video'
    }
  ]
},
{
    timestamps:true
}
);
    // middleware to hash my password before save
userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next();
    this.password =  bcrypt.hash(this.password, 10)
    next();
})

    //custom methods 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await  bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccesstoken = function(){
  return jwt.sign(
    {
      //payload
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
}

userSchema.methods.generateRefreshtoken = function(){
  return jwt.sign(
    {
      //payload
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
}
export const User = mongoose.model('User', userSchema)