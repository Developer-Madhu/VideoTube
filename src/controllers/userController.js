import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/usermodels.js'
import {ApiError} from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { CloudinaryUpload } from "../utils/Cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, password, email } = req.body;
    if ([fullname, username, password, email].some(field => field?.trim() == "")) {
        throw new ApiError(400, "Fill all the fields")
    }
    const existingUser = await User.findOne({ $or: [{ username, email }] })
    if (existingUser) {
        throw new ApiError(409, "You already registered, please login")
    }
    console.log(req.files)
    const avatarPath = req.files?.avatar[0]?.path
    const coverimgPath = req.files?.coverimg[0]?.path
    if(!avatarPath){
        throw new ApiError(400, "Avatar file missing..!")
    }

    const avatarUpload = await CloudinaryUpload(avatarPath)
    const coverimgUpload = await CloudinaryUpload(coverimgPath)

    const newuser = await User.create({
        username: username.toLowerCase(),
        fullname,
        avatar: avatarUpload.url,
        coverImg : coverimgUpload.url,
        email,
        password
    })
    const createdUser = await User.findById(newuser._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Something went wrong!")
    }
    return res
    .status(201)
    .json(new ApiResponse(201, createdUser ,"Registered user successfully"))
})

export { registerUser }