// models/CommunityPost.js
import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'role', // dynamic reference based on role
        },
        role: {
            type: String,
            required: true,
            enum: ['Employer', 'Candidate'], // only these two roles allowed
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        postTitle: { type: String, required: true },
        postImage: { type: String },
        post: { type: String, required: true },
        totalLikes: { type: Number, default: 0 },
        totalHaha: { type: Number, default: 0 },
        totalLove: { type: Number, default: 0 },
        postDate: { type: Date, default: Date.now },
    },
    { timestamps: true } // optional: adds createdAt and updatedAt automatically
);

export default mongoose.model('CommunityPost', communityPostSchema);
