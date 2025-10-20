import express from 'express';
import Candidate from '../models/candidate.js';
import bcrypt from "bcryptjs";

const router = express.Router();

// Get all candidates   
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch candidates with pagination
        const candidates = await Candidate.find()
            .populate('appliedJobs', 'title')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by newest first (you can adjust the field if needed)

        // Total count for frontend pagination
        const totalCandidates = await Candidate.countDocuments();

        res.json({
            page,
            totalPages: Math.ceil(totalCandidates / limit),
            totalCandidates,
            candidates,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /candidates?ids=cand1,cand2,cand3
router.get('/applied', async (req, res) => {
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


//get by applied job info
router.get('/by-job/:jobId', async (req, res) => {
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


// Create candidate
router.post('/', async (req, res) => {

    //const candidate = new Candidate(req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create candidate with hashed password
    const candidate = new Candidate({
      ...req.body,
      password: hashedPassword,
    });
    try {
        const newCandidate = await candidate.save();
        res.status(201).json({user: newCandidate});
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
