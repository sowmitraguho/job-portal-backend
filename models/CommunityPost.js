// models/CommunityPost.js
import mongoose from 'mongoose';

/* ---------------------------
   COMMENT SUB-SCHEMA
   --------------------------- */
const commentSchema = new mongoose.Schema(
  {
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'comments.role', // dynamically reference Employer or Candidate
    },
    role: {
      type: String,
      enum: ['Employer', 'Candidate'],
    },
    commenterName: { type: String, },
    commenterEmail: { type: String, },
    commentText: { type: String, },
    commentDate: { type: Date, default: Date.now },

    // ✅ Reactions now store user ID lists
    totalLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'comments.role', // dynamic reference
      },
    ],
    totalHaha: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'comments.role',
      },
    ],
    totalLove: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'comments.role',
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
      enum: ['Employer', 'Candidate'],
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
        refPath: 'role',
      },
    ],
    totalHaha: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role',
      },
    ],
    totalLove: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role',
      },
    ],

    postDate: { type: Date, default: Date.now },
    comments: [commentSchema], // embed comments
  },
  { timestamps: true } // adds createdAt & updatedAt
);

export default mongoose.model('CommunityPost', communityPostSchema);
