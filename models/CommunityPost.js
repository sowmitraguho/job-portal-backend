// models/CommunityPost.js
import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
    {
        username: { type: String },
        email: { type: String, required: true },
        postTitle: { type: String, required: true },
        post: { type: String, required: true },
        totalLikes: { type: Number, default: 0 },
        totalHaha: { type: Number, default: 0 },
        totalLove: { type: Number, default: 0 },
        postDate: { type: Date, default: Date.now }
    },

);

export default mongoose.model('CommunityPost', communityPostSchema);
