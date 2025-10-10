import express from 'express';
import Review from '../models/Review.js';


const router = express.Router();

/**
 * POST /api/reviews
 * Create a new review
 */
router.post('/', async (req, res) => {
    const { userName, email, rating, review, image, designation } = req.body;

    try {
        const newReview = new Review({ userName, email, rating, review, image, designation });
        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * GET /api/reviews
 * Get all reviews
 */
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
