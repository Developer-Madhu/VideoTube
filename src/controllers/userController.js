import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/usermodels.js'
import { ApiError } from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { CloudinaryUpload, deleteFileFromCloudinary } from "../utils/Cloudinary.js";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.json({ msg: "Please fill all the fields!" })
    }
    const existedUser = await User.findOne({ $or: [{ email }, { password }] })
    if (existedUser) {
        return res.json({ msg: "User Already exists" })
    }

    const crctpass = await User.CheckPassword(password)
    if (!crctpass) {
        return res.json({ msg: "Invalid Password!" })
    }
    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(existedUser._id)

    const loggedUser = await User.findById(existedUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ msg: "User Login Successfull!" })

})

const refreshAndAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken
    if (!incomingRefreshToken) {
        return res.json({ msg: "Required Refresh Token" })
    }
    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.SECRET_TOKENKEY)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            return res.json({ msg: "Invalid refresh token found!" })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.json({ msg: "Invalid user token found!" })
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
        const { refreshToken: newRefreshToken, accessToken } = await generateRefreshAndAccessToken(user._id)
        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .json({ msg: "Token Refreshed Successfully!" })

    } catch (err) {
        return res.status(500).json({ msg: `Something went wrong : ${err}` })
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: "" } }, { new: true })
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    res.clearCookie("accessToken", options)
    res.clearCookie("refreshToken", options)
    return res.status(200).json({ msg: "Logged out successfully!" })
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.CheckPassword(currentPassword)
    if (!isPasswordCorrect) {
        return res.json({ msg: "Please enter the valid password!" })
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.json({ msg: "Password changed successfully!" })
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password -refreshToken")
    return res.json({ msg: "Current user fetched successfully!", user })
})

const updateCurrentUser = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        return res.json({ msg: "Please fill all the fields to update details!" })
    }
    const user = await User.findByIdAndUpdate(req.user?._id, { $set: { fullname, email } }, { new: true })
    await user.save({ validateBeforeSave: false })
    return res.json({ msg: "Current user updated successfully!", user })
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const newavatar = req.file?.path;
    if (!newavatar) {
        return res.json({ msg: "Please upload the avatar!" })
    }
    const avatarUpdatedUrl = await CloudinaryUpload(newavatar)
    if (avatarUpdatedUrl.url) {
        const user = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatarUpdatedUrl.url } }, { new: true })
        return res.json({ msg: "Current user avatar updated successfully!", user })
    } else {
        return res.json({ msg: "Unable to update the Avatar" })
    }
})

const updateUserCoverImg = asyncHandler(async (req, res) => {
    const newCoverImg = req.file?.path;
    if (!newCoverImg) {
        return res.json({ msg: "Please upload the Cover image!" })
    }
    const coverImgUpdatedUrl = await CloudinaryUpload(newCoverImg)
    if (coverImgUpdatedUrl.url) {
        const user = await User.findByIdAndUpdate(req.user?._id, { $set: { coverImg: coverImgUpdatedUrl.url } }, { new: true })
        return res.json({ msg: "Current user Cover Image updated successfully!", user })
    } else {
        return res.json({ msg: "Unable to update the Avatar" })
    }


})


export { registerUser, loginUser, refreshAndAccessToken, logoutUser, changeCurrentPassword, getCurrentUser, updateUserAvatar, updateCurrentUser, updateUserAvatar, updateUserCoverImg }