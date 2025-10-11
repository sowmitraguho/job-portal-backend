import mongoose from "mongoose";

const subscribersSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        firstName: { type: String },
        lastName: { type: String },
        userName: { type: String },
        subscribedAt: { type: Date, default: Date.now },
    },
    { timestamps: true, collection: "subscribers" }
);

export default mongoose.model("Subscribers", subscribersSchema);
