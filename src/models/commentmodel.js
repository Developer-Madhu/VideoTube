import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema(
    {
        videos: [{ type: Schema.Types.ObjectID, ref: "Video" }],
        owner: { type: Schema.Types.ObjectID, ref: "User" },
        content: { type: String, required: true }
    },
    { timestamps: true }
)

export const Comment = mongoose.model('Comment', CommentSchema)   