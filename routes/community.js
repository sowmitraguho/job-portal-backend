import express from 'express';
import CommunityPost from '../models/CommunityPost.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import mongoose from "mongoose";

const router = express.Router();

/* -------------------------------------------
   GET ALL POSTS (latest first)
------------------------------------------- */

router.get('/', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });

    // ✅ Enhance each comment with user details using commenterId + role
    const enhancedPosts = await Promise.all(
      posts.map(async (post) => {
        const commentsWithUser = await Promise.all(
          post.comments.map(async (comment) => {
            if (!comment.commenterId || !comment.role) return comment;

            let UserModel;
            if (comment.role === 'employer') {
              UserModel = mongoose.model('Employer');
            } else if (comment.role === 'candidate') {
              UserModel = mongoose.model('Candidate');
            } else if (comment.role === 'admin') {
              UserModel = mongoose.model('Admin');
            } else {
              return comment;
            }

            const user = await UserModel.findById(comment.commenterId).lean();

            return {
              ...comment.toObject(),
              commenterDetails: user ? {
                name: user.firstName + " " + (user.lastName || ""),
                email: user.email,
                role: comment.role,
                profileImage: user.profileImage || null
              } : null
            };
          })
        );

        return {
          ...post.toObject(),
          comments: commentsWithUser
        };
      })
    );

    res.json(enhancedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* -------------------------------------------
   GET APPROVED POSTS ONLY
------------------------------------------- */


router.get('/approved', async (req, res) => {
  try {
    const posts = await CommunityPost.find({ postStatus: 'approved' })
      .sort({ createdAt: -1 });

    const enhancedPosts = await Promise.all(
      posts.map(async (post) => {
        const commentsWithUser = await Promise.all(
          post.comments.map(async (comment) => {
            if (!comment.commenterId || !comment.role) return comment;

            let UserModel;
            if (comment.role === 'employer') {
              UserModel = mongoose.model('Employer');
            } else if (comment.role === 'candidate') {
              UserModel = mongoose.model('Candidate');
            } else if (comment.role === 'admin') {
              UserModel = mongoose.model('Admin');
            } else {
              return comment;
            }

            const user = await UserModel.findById(comment.commenterId).lean();

            return {
              ...comment.toObject(),
              commenterDetails: user ? {
                name: user.firstName + " " + (user.lastName || ""),
                email: user.email,
                role: comment.role,
                profileImage: user.profileImage || null
              } : null
            };
          })
        );

        return {
          ...post.toObject(),
          comments: commentsWithUser
        };
      })
    );

    res.json(enhancedPosts);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* -------------------------------------------
   GET SINGLE POST BY ID
------------------------------------------- */
router.get('/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get total reaction IDs and counts for a specific post
router.get('/:id/reactions', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .select('totalLikes totalLove totalHaha');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      postId: post._id,
      reactions: {
        likes: {
          count: post.totalLikes.length,
          ids: post.totalLikes,
        },
        love: {
          count: post.totalLove.length,
          ids: post.totalLove,
        },
        haha: {
          count: post.totalHaha.length,
          ids: post.totalHaha,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all posts by a specific user (by userId)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userPosts = await CommunityPost.find({ userId })
      .sort({ createdAt: -1 });

    if (!userPosts || userPosts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    res.json({
      userId,
      totalPosts: userPosts.length,
      posts: userPosts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* -------------------------------------------
   CREATE NEW POST
------------------------------------------- */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { postTitle, postImage, post } = req.body;

    const newPost = new CommunityPost({
      userId: req.user.id,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      postTitle,
      postImage,
      post,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* -------------------------------------------
   EDIT POST (only by post owner, not status)
------------------------------------------- */
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only post owner can edit
    if (post.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized to edit this post' });

    const { postTitle, postImage, post: postText } = req.body;
    post.postTitle = postTitle ?? post.postTitle;
    post.postImage = postImage ?? post.postImage;
    post.post = postText ?? post.post;

    await post.save();
    res.json({ message: 'Post updated successfully', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------
   CHANGE POST STATUS (only admin)
------------------------------------------- */
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Only admin can change post status' });

    const { status } = req.body; // "approved" or "pending"
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.postStatus = status;
    await post.save();
    res.json({ message: 'Post status updated', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------
   DELETE POST (only by owner or admin)
------------------------------------------- */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user.id && req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Unauthorized to delete this post' });

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------
   ADD COMMENT
------------------------------------------- */
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { commentText } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // const newComment = {
    //   commenterId: req.user.id,
    //   role: req.user.role.toLowerCase(),
    //   commenterName: `${req.user.firstName} ${req.user.lastName}`,
    //   commenterEmail: req.user.email,
    //   commentText,
    // };
    let UserModel;

    const role = req.user.role.toLowerCase();
    if (role === "employer") UserModel = mongoose.model("Employer");
    if (role === "candidate") UserModel = mongoose.model("Candidate");
    if (role === "admin") UserModel = mongoose.model("Admin");

    const userData = await UserModel.findById(req.user.id).lean();

    const newComment = {
      commenterId: req.user.id,
      role: req.user.role.toLowerCase(),
      commenterName: `${userData.firstName} ${userData.lastName}`,
      commenterEmail: userData.email,
      commentText,
    };


    post.comments.push(newComment);
    await post.save();
    res.status(201).json({ message: 'Comment added successfully', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------
   DELETE COMMENT (only commenter or admin)
------------------------------------------- */
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.commenterId.toString() !== req.user.id && req.user.role !== 'Admin')
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });

    comment.deleteOne();
    await post.save();
    res.json({ message: 'Comment deleted successfully', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------
   REACT TO POST (like/love/haha toggle)
------------------------------------------- */
router.patch('/:id/react', verifyToken, async (req, res) => {
  try {
    const { type } = req.body; // "like", "love", or "haha"
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Remove user from all reaction arrays first
    ['totalLikes', 'totalHaha', 'totalLove'].forEach((field) => {
      post[field] = post[field].filter(
        (id) => id.toString() !== req.user.id
      );
    });

    // Add to selected reaction type if not already there
    const fieldMap = {
      like: 'totalLikes',
      haha: 'totalHaha',
      love: 'totalLove',
    };

    if (fieldMap[type]) post[fieldMap[type]].push(req.user.id);

    await post.save();
    res.json({ message: `Reaction updated (${type})`, post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -------------------------------------------
   REACT TO COMMENTS (like/love/haha toggle)
------------------------------------------- */
router.patch('/:postId/comments/:commentId/react', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { type } = req.body; // "like", "love", or "haha"
    const userId = req.user.id;

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Find the comment inside post
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Remove user from all reaction arrays first
    ['totalLikes', 'totalHaha', 'totalLove'].forEach((field) => {
      comment[field] = comment[field].filter(id => id.toString() !== userId);
    });

    // Map type to field
    const fieldMap = {
      like: 'totalLikes',
      haha: 'totalHaha',
      love: 'totalLove'
    };

    // Add user to selected reaction type
    if (fieldMap[type]) comment[fieldMap[type]].push(userId);

    await post.save();

    res.json({
      message: `Reaction updated (${type}) for comment`,
      comment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
