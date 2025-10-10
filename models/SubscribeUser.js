import mongoose from "mongoose";

const subscribeUserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        userName: { type: String, required: true },
        subscribedAt: { type: Date, default: Date.now },
    },
    { timestamps: true, collection: "subscribers" }
);

export default mongoose.model("SubscribeUser", subscribeUserSchema);
