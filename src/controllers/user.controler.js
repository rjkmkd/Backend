import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser = asyncHandler( async (req, res) => {
   //1. get data from frontend/req.body
   //2. validate data - Not empty, valid email, password length
   //3. check if user exists : username, email
   //4. check for image file, avarat
   //5. upload them on cloudinary
   //6. create user object - create entry in db
   //7. remove password & refresh token from user object response
   //8. check for user creation
   //9. return response to frontend

   //  take data from user
   const {userName, fullName, email, password} = req.body
   // console.log(userName, fullName, email, password);
   
   // if(!userName || !fullName || !email || !password){
   //    res.status(400)
   //    throw new ApiError(400,"Please fill all the fields")
   // }
    
   // validate data

   if([userName, fullName, email, password].some((fields)=>fields ==="")){
         throw new ApiError(400,"Please fill all the fields")
   }

   //check if user already exist or not
   const existedUser = await User.findOne({$or:[{userName}, {email}]})

   if(existedUser){
      throw new ApiError(409,"user already exist with this userName or email")
   }
      // hadel file upload
   const avatarLocalpath = req.files?.avatar[0]?.path;
   // const coverImageLocalpath = req.files?.coverImage[0]?.path;
   let coverImageLocalpath="";
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalpath = req.files.coverImage[0]?.path;
   }

   if(!avatarLocalpath){
      throw new ApiError(400,"Avatar is required!")
   }
   const avatar = await uploadOnCloudinary(avatarLocalpath);
   let coverImage="";
   if(coverImageLocalpath){

      coverImage = await uploadOnCloudinary(coverImageLocalpath);
   }
   if(!avatar){
      throw new ApiError(400, "Avatar is required!");
   }
   // create user
   const user = await User.create({
      userName:userName.toLowerCase(),
      fullName,
      avatar:avatar.url,
      coverImage:coverImage?.url || "",
      email,
      password,
   })

   // check if useer created or not
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if(!createdUser){
      throw new ApiError(500,"Something went wrong while registration of user")
   }

   return res.status(200).json(
      new ApiResponse(200,createdUser,"user created successfully!!")
   )
})

export {registerUser}