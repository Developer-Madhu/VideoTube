import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

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

userSchema.pre('save', async function(next){
    if(!this.modified("password")) return next()
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.CheckPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)