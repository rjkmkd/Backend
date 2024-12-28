import {Router} from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  updateImages,
  getCurrentUser
} from "../controllers/user.controler.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/Auth.middleware.js"
const router = Router()

router.route("/register").post(
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
  registerUser
);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-password").post(verifyJWT, updatePassword);
router.route("/update-image").post(verifyJWT,upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]), updateImages);

  router.route("/get-currentUser").get(verifyJWT, getCurrentUser);
export default router;