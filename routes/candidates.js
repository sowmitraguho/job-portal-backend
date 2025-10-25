import express from 'express';
import Candidate from '../models/candidate.js';
import bcrypt from "bcryptjs";
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all candidates   
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch candidates with pagination
        const candidates = await Candidate.find()
            .populate('appliedJobs', 'jobTitle')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest first 

        // Total count for frontend pagination
        const totalCandidates = await Candidate.countDocuments();

        res.json({
            page,
            totalPages: Math.ceil(totalCandidates / limit),
            totalCandidates,
            hasNextPage: page * limit < totalCandidates,
            hasPrevPage: page > 1,
            candidates,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /candidates?ids=cand1,cand2,cand3
router.get('/applied', verifyToken, async (req, res) => {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ message: 'No ids provided' });

    const idArray = (ids).split(',');
    try {
        const candidates = await Candidate.find({ _id: { $in: idArray } });
        res.json({ candidates });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//get by applied job info
router.get('/by-job/:jobId', verifyToken, async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.query; // optional filter

    try {
        // Build the filter dynamically
        const filter = { 'appliedJobs.job': jobId };

        if (status) {
            filter['appliedJobs.status'] = status; // only candidates with this status
        }

        const candidates = await Candidate.find(filter)
            .populate('appliedJobs.job', 'jobTitle companyName')
            .select('name email phone appliedJobs');

        if (!candidates.length) {
            return res.status(404).json({ message: 'No candidates found for this job' });
        }

        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get single Candidate
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('appliedJobs', 'jobTitle');
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json(candidate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Create candidate
router.post('/', async (req, res) => {
    const existing = await Candidate.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    //const candidate = new Candidate(req.body);
    if (!req.body.password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);


    // Create candidate with hashed password
    const candidate = new Candidate({
        ...req.body,
        password: hashedPassword,
    });
    try {
        const newCandidate = await candidate.save();
        res.status(201).json({ user: newCandidate });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Candidate
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { job, status, primaryEnquiries } = req.body;
        const candidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { $push: { appliedJobs: { job, status, primaryEnquiries } } },
            { new: true }
        );
        res.json(candidate);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete Candidate
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Candidate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Candidate deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
