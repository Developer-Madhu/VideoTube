import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
    {
        channel: [{ type: Schema.Types.ObjectID, ref: "User" }],
        subscriber: { type: Schema.Types.ObjectID, ref: "User" }
    },
    { timestamps: true }
)

export const Subscription = mongoose.model('Subscription', SubscriptionSchema)   