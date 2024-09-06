import { asyncHandler } from "../utils/asyncHandler.js";



const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message:"register successfull"
    })
})
const logInUser = asyncHandler( async (req, res) => {
    res.status(200).json({
        message:"LogIN successfull"
    })
})

export {registerUser, logInUser}
