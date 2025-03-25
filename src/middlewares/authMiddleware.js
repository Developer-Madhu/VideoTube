import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import dotenv from 'dotenv'

dotenv.config()

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer","")
        if(!token){
         throw new ApiError(400,"Please login to access this page (Unauthorized)")
        }
        const decoded = jwt.verify(token,process.env.SECRET_TOKENKEY)
        if(!decoded){
         throw new ApiError(400,"Invalid token found!")
        }
        const user = await User.findById(decoded?._id).select("-refreshToken -password")
        if(!user){
         throw new ApiError(400,"User not found!")
        }
        req.user = user
        next()
     } catch (error) {
       throw new ApiError(500, "Something went wrong while verifying token")
     } 
})
