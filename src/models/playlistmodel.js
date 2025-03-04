import mongoose, { Schema } from "mongoose";

const PlaylistSchema = new Schema(
    {
        name: { type: String, required: true },
        videos: [{ type: Schema.Types.ObjectID, ref: "Video" }],
        description: { type: String, required: true },
        owner: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
)

export const Playlist = mongoose.model('Playlist', PlaylistSchema)   