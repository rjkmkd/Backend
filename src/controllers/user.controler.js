import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

// method to generate access and refresh token
const generateaccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccesstoken();
    const refreshToken = await user.generateRefreshtoken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
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
  const { userName, fullName, email, password } = req.body;
  // console.log(userName, fullName, email, password);

  // if(!userName || !fullName || !email || !password){
  //    res.status(400)
  //    throw new ApiError(400,"Please fill all the fields")
  // }

  // validate data

  if ([userName, fullName, email, password].some((fields) => fields === "")) {
    throw new ApiError(400, "Please fill all the fields");
  }

  //check if user already exist or not
  const existedUser = await User.findOne({ $or: [{ userName }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "user already exist with this userName or email");
  }
  // hadel file upload
  const avatarLocalpath = req.files?.avatar[0]?.path;
  // const coverImageLocalpath = req.files?.coverImage[0]?.path;
  let coverImageLocalpath = "";
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalpath = req.files.coverImage[0]?.path;
  }

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar is required!");
  }
  const avatar = await uploadOnCloudinary(avatarLocalpath);
  let coverImage = "";
  if (coverImageLocalpath) {
    coverImage = await uploadOnCloudinary(coverImageLocalpath);
  }
  if (!avatar) {
    throw new ApiError(400, "Avatar is required!");
  }
  // create user
  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
  });

  // check if useer created or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registration of user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user created successfully!!"));
});

const loginUser = asyncHandler(async (req, res) => {
  //1. take data from user
  //2. validate data
  //3. find user
  //4. check password
  //5. access token and refresh token
  //6. send the tokens into cookies
  //7. send response

  const { userName, email, password } = req.body;
  if ((!userName || !email) && !password) {
    throw new ApiError(400, "all feilds are requirdes!!");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not exist!!");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid password");
  }

  const { refreshToken, accessToken } = await generateaccessAndRefreshToken(
    user._id
  );

  const loggedinUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean(); // Convert to plain JS object to avoid circular references

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(200, {
        user: loggedinUser,
        refreshToken,
        accessToken,
      },
      "User logged In Successfully!"
   )
    );

});

const logoutUser = asyncHandler(async (req, res) => {
  //1. clean the cookies
  //2. clear refresh token from db
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refrechToken: undefined,
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
    .json(new ApiResponse(200, {}, "User logged Out successfully!"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
  try {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incommingRefreshToken){
      throw new ApiError(401,"Unauthorized request!")
    }
    // console.log(incommingRefreshToken);
    
    const decoded_info = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log(decoded_info);
    
    if (!decoded_info) {
      // console.log("hello");
      
      throw new ApiError(401, "Invalid Refresh token!");
    }
    const user = await User.findById(decoded_info._id);
    if(!user){
      throw new ApiError(401, "Invalid Refresh Token !");
    }
    
    if (incommingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!");
    }
  
    const option = {
      httpOnly:true,
      secure:true
    }
  
    const { accessToken, newRefreshToken } = await generateaccessAndRefreshToken(user._id)
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(new ApiResponse(200,{accessToken, refrechToken:newRefreshToken},"Access Token refreshed successfully!!"));
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid refresh token!!")
  }

})

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken 
};
