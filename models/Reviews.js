import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        userName: { type: String },
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
