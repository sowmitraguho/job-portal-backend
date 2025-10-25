import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // can be Candidate or Employer
        role: { type: String, enum: ['Candidate', 'Employer'] }, // specify the role
        firstName: { type: String },
        lastName: { type: String },
        userName: { type: String },
        designation: { type: String },
        email: { type: String, required: true }, // store email of reviewer
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String },
        image: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
