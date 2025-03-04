import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema(
    {
        comment: { type: Schema.Types.ObjectId, ref: "Comment" },
        videos: [{ type: Schema.Types.ObjectID, ref: "Video" }],
        tweet: { type: Schema.Types.ObjectID, ref: "Tweet" },
        likedBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
)

export const Like = mongoose.model('Like', LikeSchema)   