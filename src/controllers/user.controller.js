import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { deleteColudinaryFile } from "../utils/deleteCloudinaryFiles.js";
import fs from "fs";

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
  
      const existedUser = await User.findOne({
          $or : [{username},{email}]
      })
  
      if(existedUser){ 
          throw new ApiError(409,"User with email or usename already exist!")
      }
      

      const avtarLOcalPath = req.files?.avatar[0]?.path;
      
      console.log(avtarLOcalPath);
      
      
      let coverImageLOcalPath
      //  console.log("req.files: ", req.files);
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
          coverImageLOcalPath = req.files?.coverImage[0]?.path;
      }
      console.log(coverImageLOcalPath);
      
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
  // console.log(email);
  

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

const logOutUser = asyncHandler(async (req, res) => {
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // take refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
      throw new ApiError(401, "Invalid refresh token")
    }
    // decode user info from that incoming refresh token
    const decodedUserInfo = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    // db call to find the user by userId
    const user = await User.findById(decodedUserInfo._id)
    if(!user){
      throw new ApiError(401, "something went wrong, invalid refresh token")
    }
    // check the refresh token from cookie and the refresh token savrd in db are same or not
    if(incomingRefreshToken !== user.refreshToken){
      throw new ApiError(401, "invalid refresh token!")
    }
  
    const { accessToken, newRefreshToken } = await generateAccessandRefreshToken(
      user._id
    );
  
    const option = {
      httpOnly:true,
      secure: true,
    }
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", newRefreshToken, option)
    .json(new ApiResponse(
      200,
      {
        accessToken,
        refreshToken: newRefreshToken
      },
      "Access Token Refreshed"
    ))
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token")
  }

})

const UpdatePassward = asyncHandler(async (req, res) => {
  // taking data from frontend
  const { oldPassward, newPassward, confirmPassward } = req.body;
  // check all fields are present or not
  if (!oldPassward && !newPassward && !confirmPassward) {
    throw new ApiError(401, "All fields are required!");
  }
  // check newpassward and confirmpassward is same or not
  if (!(newPassward === confirmPassward)) {
    throw new ApiError(401, "please field correct info");
  }
  // db call for passward
  // we can directly use req.user due to auth middleware
  const user = await User.findById(req.user._id);
  // check oldpassward is matched with the passward that is stored in database or not
  const isPasswardValid = await user.isPasswordCorrect(oldPassward)
  if (!isPasswardValid) {
    throw new ApiError(400, "Invalid passward");
  }
  user.passward = newPassward
  await user.save({validateBeforeSave:true})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password Update successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
    200,
    res.user,
    "user fetched successfully!!"
  ))
})

const updateUserDetailes = asyncHandler(async (req, res) => {
  const {fullname, email, passward} = req.body;
  if(!(fullname || email) || !passward){
    throw new ApiError(400, "please fill the required fields")
  }
  const user = await User.findById(req.user?._id)
  const isPasswardValid = await user.isPasswordCorrect(passward);
  if (!isPasswardValid) {
    throw new ApiError(200, "invalid password!!");
  }
  // if(fullname){
  //   user.fullname = fullname;
  // }
  
  // if(email){
  //   user.email = email;
  // }
  // await user.save({validateBeforeSave:true})

  // differnt method

  if(fullname){
  await User.findByIdAndUpdate(
    user._id,
    {
      $set:{
        fullname
      }
    }
  )
  }
  if(email){
  await User.findByIdAndUpdate(
    user._id,
    {
      $set:{
        email
      }
    }
  )
  }
  return res.status(200).json(new ApiResponse(200,{},"Update successfully"));

})

const updateImages = asyncHandler(async (req, res) => {

  const avtarLOcalPath = req.files?.avatar[0]?.path;
  const coverImageLOcalPath = req.files?.coverImage[0]?.path;

  // if(!(avtarLOcalPath || coverImageLOcalPath)){
  //   throw new ApiError(400,"Image required")
  // }

  const user = await User.findById(req.user?._id).select(
    "-passward -refreshToken"
  );
  const oldAvatarUrl = user?.avatar
  const oldCoverImageUrl = user?.coverImage

  // console.log(oldAvatarUrl)
  // console.log(oldCoverImageUrl);

  if (avtarLOcalPath) {
    const avatar = await uploadOnCloudinary(avtarLOcalPath);
    // user.avatar = avatar?.url
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      {
        new: true,
      }
    );
      await deleteColudinaryFile(oldAvatarUrl);
  }

  if(coverImageLOcalPath){
    const coverImage = await uploadOnCloudinary(coverImageLOcalPath);
    // user.coverImage = coverImage?.url
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      {
        new: true,
      }
    );
     await deleteColudinaryFile(oldCoverImageUrl);
  }

  const UpdatedUser = await User.findById(user?._id).select("-passward -refreshToken")

  // user.save({validateBeforeSave:true})
  return res
    .status(200)
    .json(
      new ApiResponse(200, { UpdatedUser }, "update successfully!!")
    );
})


export {
  registerUser,
  logInUser,
  logOutUser,
  refreshAccessToken,
  UpdatePassward,
  getCurrentUser,
  updateUserDetailes,
  updateImages
};
