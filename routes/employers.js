import express from 'express';
import Employer from '../models/Employer.js';
import Job from '../models/Job.js';

const router = express.Router();

// Get all employers
router.get('/', async (req, res) => {
  try {
    const employers = await Employer.find().populate('jobsPosted', 'jobTitle');
    res.json(employers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single employer
router.get('/:id', async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id).populate('jobsPosted', 'jobTitle');
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    res.json(employer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create employer
router.post('/', async (req, res) => {
  const employer = new Employer(req.body);
  try {
    const newEmployer = await employer.save();
    res.status(201).json(newEmployer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update employer
router.put('/:id', async (req, res) => {
  try {
    const updatedEmployer = await Employer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEmployer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete employer
router.delete('/:id', async (req, res) => {
  try {
    await Employer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all applicants of employer's jobs
router.get('/:id/applicants', async (req, res) => {
  const { id } = req.params; // employer ID
  try {
    const jobs = await Job.find({ employer: id })
      .populate('applicants', 'name email skills profileImage resume experience education') // populate applicant details
      .exec();

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
