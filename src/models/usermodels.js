import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, index: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: [true, "Password is required!"] },
        fullname: { type: String, required: true, unique: true, trim: true, index: true },
        avatar: { type: String, required: true },
        coverImg: { type: String },
        watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],
        refreshToken: { type: String },
        timestamps: {required :true}
    }

)

export const User = mongoose.model("User", userSchema)