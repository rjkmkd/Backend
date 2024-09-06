import { Router } from "express";
import { logInUser, registerUser } from "../controllers/user.controller.js";

const router = Router()
router.route("/login").get(logInUser)
router.route("/register").post(registerUser)
// router.route("/register").post(registerUser)

export default router