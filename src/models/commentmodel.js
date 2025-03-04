import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CommentSchema = new Schema(
    {
        videos: [{ type: Schema.Types.ObjectID, ref: "Video" }],
        owner: { type: Schema.Types.ObjectID, ref: "User" },
        content: { type: String, required: true }
    },
    { timestamps: true }
)
CommentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model('Comment', CommentSchema)   