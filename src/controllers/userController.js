import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/usermodels.js'
import { ApiError } from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { CloudinaryUpload, deleteFileFromCloudinary } from "../utils/Cloudinary.js";


const generateRefreshAndAccessToken = async (userId) => {
   try {
     const findUser = await User.findById(userId)
     if (!findUser) {
         throw new ApiError(404, "User Not Found!")
     }
     const accessToken = findUser.tokenGenerator()
     const refreshToken = findUser.refreshTokens()
 
     findUser.refreshToken = refreshToken
     await findUser.save({ validateBeforeSave: false })
 
     return { accessToken, refreshToken }
   } catch (error) {
    throw new ApiError(500, "Error generating tokens for users")
   }
}


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
    if (!avatarPath) {
        throw new ApiError(400, "Avatar file missing..!")
    }

    let coverImg;
    try {
        coverImg = await CloudinaryUpload(coverimgPath)
        console.log("Cover image uploaded successfully")
    } catch (error) {
        console.log("Something went wrong while uploading cover image", error)
    }

    let avatar;
    try {
        avatar = await CloudinaryUpload(avatarPath)
        console.log("Avatar uploaded successfully")
    } catch (error) {
        console.log("Something went wrong while uploading Avatar", error)
    }

    try {
        const newuser = await User.create({
            username: username.toLowerCase(),
            fullname,
            avatar: avatar.url,
            coverImg: coverImg.url,
            email,
            password
        })
        const createdUser = await User.findById(newuser._id).select("-password -refreshToken")
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong!")
        }
        return res
            .status(201)
            .json(new ApiResponse(201, createdUser, "Registered user successfully"))
    } catch (error) {
        console.log("Something went wrong while registering user", error)
        if (avatar) {
            await deleteFileFromCloudinary(avatar.public_id)
        }
        if (coverImg) {
            await deleteFileFromCloudinary(coverImg.public_id)
        }
        throw new ApiError(500, "Something went wrong while registering user & deleted images")
    }
})

export { registerUser }