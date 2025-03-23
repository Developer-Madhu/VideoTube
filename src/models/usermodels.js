import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

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
    },
    {timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.modified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.CheckPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.tokenGenerator = function () {
    return jwt.sign(
        { _id: this._id, username: this.username, email: this.email },
        process.env.SECRET_TOKENKEY,
        { expiresIn: process.env.TOKEN_EXPIRETIME }
    )
}

userSchema.methods.refreshTokens = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKENKEY,
        { expiresIn: process.env.REFRESH_EXPIRETIME }
    )
}

export const User = mongoose.model("User", userSchema)