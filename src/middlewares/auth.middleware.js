import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async(req, res, next) => {
    try {
        const accessToken =
          req.cookies.accessToken ||
          req.header("Authorization")?.replace("Bearer ", "");
        if(!accessToken){
            throw new ApiError(500, "something went wrong !!")
        }
        const decodedUserInfo = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedUserInfo?._id).select(
          "-passward -refreshToken"
        );
        if(!user){
            throw new ApiError(401, "invalid access token");
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
})