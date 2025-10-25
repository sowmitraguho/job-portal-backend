import express from 'express';
import Review from '../models/Review.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a review
router.post('/', verifyToken, async (req, res) => {
    const { rating, review, image, designation } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const newReview = new Review({
            userId: req.user.id,        // ID from auth token
            role: req.user.role,        // role from auth token: 'Candidate' or 'Employer'
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            userName: req.user.userName || '', // optional username
            rating,
            review,
            image,
            designation
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get review by ID
router.get('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
