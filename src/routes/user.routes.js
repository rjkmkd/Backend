import { Router } from "express";
import { logInUser, logOutUser, registerUser,refreshAccessToken, updateUserDetailes, UpdatePassward, updateImages } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { userExist } from "../middlewares/userExist.middleware.js";
const router = Router()

router.route("/register").post(
  userExist,  
  upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),
    registerUser
)
router.route("/login").post(logInUser)
// secure routes
router.route("/logout").post(verifyJwt, logOutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/updatepassword").post(verifyJwt, UpdatePassward)
router.route("/updateInfo").post(verifyJwt, updateUserDetailes)
router.route("/updateimages").post(
  verifyJwt,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateImages
);

export default router