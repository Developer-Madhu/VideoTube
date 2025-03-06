import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

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

export { CloudinaryUpload }