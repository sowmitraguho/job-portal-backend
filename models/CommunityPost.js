// models/CommunityPost.js
import mongoose from 'mongoose';

/* ---------------------------
   COMMENT SUB-SCHEMA
   --------------------------- */
const commentSchema = new mongoose.Schema(
  {
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    role: {
      type: String,
    },
    commenterName: { type: String, },
    commenterEmail: { type: String, },
    commentText: { type: String, },
    commentDate: { type: Date, default: Date.now },

    // ✅ Reactions now store user ID lists
    totalLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    totalHaha: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    totalLove: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { _id: true }
);

/* ---------------------------
   MAIN COMMUNITY POST SCHEMA
   --------------------------- */
const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'role', // dynamic reference based on post author role
    },
    role: {
      type: String,
    },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    postTitle: { type: String },
    postImage: { type: String },
    post: { type: String },
    postStatus: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    // Post reactions also store lists of user IDs
    totalLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    totalHaha: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    totalLove: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],

    postDate: { type: Date, default: Date.now },
    comments: [commentSchema], // embed comments
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model('CommunityPost', communityPostSchema);
