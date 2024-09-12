import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const userExist = asyncHandler(async (req, _, next) => {
    const {username, email} = req.body;
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!existedUser) {
      next();
    } else {
      throw new ApiError(400, "User allready exist");
    }
})
export {userExist}