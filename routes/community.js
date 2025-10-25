// routes/communityRoutes.js
import express from 'express';
import CommunityPost from '../models/CommunityPost.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all posts (latest first)
router.get('/', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single post details by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post); // Includes poster info, reactions, totals, post content, etc.
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a post
router.post('/', verifyToken, async (req, res) => {
  try {
    // req.user should contain id, role, firstName, lastName, email from auth middleware
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

// React to a post (like, haha, love)
router.patch('/:id/react', verifyToken, async (req, res) => {
  const { type } = req.body; // type = 'like' | 'haha' | 'love'

  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Initialize reactions array if not present
    if (!post.reactions) post.reactions = [];

    const existingReaction = post.reactions.find(
      (r) => r.userId.toString() === req.user.id
    );

    if (existingReaction) {
      // Toggle or change reaction
      if (existingReaction.type === type) {
        post.reactions = post.reactions.filter((r) => r.userId.toString() !== req.user.id);
      } else {
        existingReaction.type = type;
      }
    } else {
      post.reactions.push({ userId: req.user.id, type });
    }

    // Recalculate totals
    post.totalLikes = post.reactions.filter((r) => r.type === 'like').length;
    post.totalHaha = post.reactions.filter((r) => r.type === 'haha').length;
    post.totalLove = post.reactions.filter((r) => r.type === 'love').length;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
