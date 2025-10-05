import express from 'express';
import Job from '../models/Job.js';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    // Get page and limit from query params, default values if not provided
    const page = parseInt(req.query.page) || 1; // default page = 1
    const limit = parseInt(req.query.limit) || 10; // default 10 jobs per page
    const skip = (page - 1) * limit; // calculate how many documents to skip

    // Fetch jobs with pagination
    const jobs = await Job.find()
      .populate('employer', 'name companyName email')
      .skip(skip)
      .limit(limit);

    // Optional: total count for frontend to calculate total pages
    const totalJobs = await Job.countDocuments();

    res.json({
      page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      jobs
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name companyName email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create job
router.post('/', async (req, res) => {
  const job = new Job(req.body);
  try {
    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update job
router.put('/:id', async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete job
router.delete('/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
