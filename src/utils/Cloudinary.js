import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const CloudinaryUpload = async (filepath) => {
    try {
        if (!filepath) return null
        const uploadFiles = await cloudinary.uploader.upload(filepath, { resource_type: 'auto' })
        console.log("Cloudinary Upload Successful", uploadFiles.url)
        fs.unlinkSync(filepath)
        return uploadFiles
    } catch (e) {
        fs.unlinkSync(filepath)
        return null
    }
}

const deleteFileFromCloudinary = async (public_id) => {
    try {
        const res = await cloudinary.uploader.destroy(public_id)
        console.log("Cloudinary Delete Successful", res)
    } catch (error) {
        console.log("Cloudinary Delete Failed", error)
    }
}

export { CloudinaryUpload, deleteFileFromCloudinary }