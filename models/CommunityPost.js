// models/CommunityPost.js
import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    post: { type: String, required: true },
    totalLikes: { type: Number, default: 0 },
    totalHaha: { type: Number, default: 0 },
    totalLove: { type: Number, default: 0 },
    postDate: { type: Date, default: Date.now },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['like', 'haha', 'love'] },
      },
    ],
  },
  { timestamps: true }
  
);

export default mongoose.model('CommunityPost', communityPostSchema);
