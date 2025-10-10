import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userName: { type: String, required: true },
        designation: { type: String },
        email: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String, required: true },
        image: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
