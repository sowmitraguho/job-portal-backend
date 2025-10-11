import express from 'express';
import Candidate from '../models/candidate.js';

const router = express.Router();

// Get all candidates   
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find().populate('appliedJobs', 'title');
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single employee
router.get('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('appliedJobs', 'title');
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json(candidate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create candidate
router.post('/', async (req, res) => {
    const candidate = new Candidate(req.body);
    try {
        const newCandidate = await candidate.save();
        res.status(201).json(newCandidate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update employee
router.put('/:id', async (req, res) => {
    try {
        const { job, status, primaryEnquiries } = req.body;
        const candidate = await Employee.findByIdAndUpdate(
            req.params.id,
            { $push: { appliedJobs: { job, status, primaryEnquiries } } },
            { new: true }
        );
        res.json(candidate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete employee
router.delete('/:id', async (req, res) => {
    try {
        await Candidate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Candidate deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
