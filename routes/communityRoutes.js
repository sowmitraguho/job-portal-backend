// routes/communityRoutes.js
import express from 'express';
import CommunityPost from '../models/CommunityPost.js';

const router = express.Router();

/**
 * GET /api/community
 * Fetch all community posts (sorted by latest)
 */
router.get('/', async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/community
 * Create a new community post
 */
router.post('/', async (req, res) => {
  try {
    const newPost = new CommunityPost(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PATCH /api/community/:id/react
 * Add or toggle a reaction (like, haha, love)
 */
router.patch('/:id/react', async (req, res) => {
  const { userId, type } = req.body; // type = 'like' | 'haha' | 'love'

  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existingReaction = post.reactions.find(r => r.userId.toString() === userId);

    if (existingReaction) {
      // Toggle or change reaction
      if (existingReaction.type === type) {
        // Remove reaction if same type clicked again
        post.reactions = post.reactions.filter(r => r.userId.toString() !== userId);
      } else {
        // Change reaction type
        existingReaction.type = type;
      }
    } else {
      // Add new reaction
      post.reactions.push({ userId, type });
    }

    // Recalculate totals
    post.totalLikes = post.reactions.filter(r => r.type === 'like').length;
    post.totalHaha = post.reactions.filter(r => r.type === 'haha').length;
    post.totalLove = post.reactions.filter(r => r.type === 'love').length;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await CommunityPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;