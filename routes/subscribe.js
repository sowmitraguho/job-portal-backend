import express from 'express';
import Subscription from '../models/Subscribers.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, userName } = req.body;

    try {
        const newSubscriber = new Subscription({ email, userName });
        await newSubscriber.save();
        res.status(201).json(newSubscriber);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const subscribers = await Subscription.find().sort({ subscribedAt: -1 });
        res.json(subscribers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
