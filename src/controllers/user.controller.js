import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
   
    // get user details from frontend
    // validation -- not empty
    // chexk if user already exist: username & email
    // check for images, check for avater
    // upload them to cloudinary, avater
    // create user object -- create user entry in db
    // remove passward and refrech token from responce
    // check for user creation
    // return res

    const {fullname, email, username, passward}=req.body
    console.log("email:",email);
    
   if( [fullname, email, username, passward].some(ele => ele?.trim === "")
   ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser=User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or usename already exist!")
    }

    const avtarLOcalPath=req.files?.avatar[0]?.path;
    const coverImageLOcalPath=req.files?.coverImage[0]?.path;

    if(!avtarLOcalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avtarLOcalPath)
    const coverImage = await uploadOnCloudinary(coverImageLOcalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create(
        {
            fullname,
            avatar:avatar.url,
            coverImage: coverImage?.url || "",
            email,
            passward,
            username:username.toLowerCase()
        }
    )

    const createdUser = await user
      .findById(user._id)
      .select("-passward -refreshToken");


    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring user ")
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully!!")
    )
})
const logInUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message:"LogIN successfull"
    })
})

export {registerUser, logInUser}
