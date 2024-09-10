import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// function for generating access & refresh tokes

const generateAccessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "somthing is incorrect while generating tokens")
    }
}


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
    // console.log("req.body from user.controler.js",req.body);

    
    const {fullname, email, username, passward}=req.body
    // console.log("email:",email);
    
   if( [fullname, email, username, passward].some(ele => ele?.trim === "")
   ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser= await User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or usename already exist!")
        
    }

    const avtarLOcalPath=req.files?.avatar[0]?.path;
    
    console.log(avtarLOcalPath);
    
    
    let coverImageLOcalPath
     console.log("req.files: ", req.files);
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLOcalPath = req.files?.coverImage[0]?.path;
    }

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

    
    const createdUser = await User
      .findById(user?._id)
      .select("-passward -refreshToken");


    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring user ")

    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully!!")
    )
})
const logInUser = asyncHandler( async (req, res) => {
  //reqest body => data
  // validate data
  // check username, email
  // find user
  // check passward
  // acess and refres token generate
  // send these tokens with cookes

  // collect data

  const { email, username, passward } = req.body
  // valiadte user give data or not
  console.log(email);
  

  if (!(username || email)) {
    throw new ApiError(400, "username or email required");
  }
  // find user on the bases of either usernamr or email

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  // if user not exist

  if (!user) {
    throw new ApiError(400, "User not exist with this username or eamil");
  }

  // check passward
  // we already create a isPasswardCorrect method in or userModel
  // we check passward using bcrypt
  // all methods that we create (i.e. isPasswordCorrect, generateAccessToken etc) has access with our "user" instance not in mongodb "User"

  const isPasswardValid = await user.isPasswordCorrect(passward)
    //if passward is incorrect

    if(!isPasswardValid){
        throw new ApiError(400, "incorrect password")
    }

    // generate Access and Refresh tokens 
    const {accessToken, refreshToken} = await generateAccessandRefreshToken(user._id)

    // here we can take one more new referense of User object after save the rehreshToken feild
    const loggedInUser = await User.findById(user._id).select(
      "-passward -refreshToken"
    );

    // send cookie

    const option = {
        // through these option our cookie is only modifiable by server only
        httpOnly: true,
        secure: true
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User loggedIn successfully"
        )
      );

})
const logOutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: ""
        },
      },
      {
        new: true,
      }
    );
const option = {
  httpOnly: true,
  secure: true,
};
    return res
      .status(200)
      .clearCookie("accessToken", option)
      .clearCookie("refreshToken", option)
      .json(new ApiResponse(200, {}, "User Logged out successfully!!"));

})

export {registerUser, logInUser, logOutUser}
