import express from 'express';
import Job from '../models/Job.js';
import Employee from '../models/candidate.js';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch jobs with pagination
    const jobs = await Job.find()
      .populate('employer', 'name companyName email')
      .skip(skip)
      .limit(limit).sort({ postedAt: -1 })
      .sort({ postedAt: -1 });

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
    const { applicant, status, primaryEnquiries } = req.body;
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $push: { applicants: { applicant, status, primaryEnquiries } } },
      { new: true }
    );
    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { applicantId, status } = req.body;

    // Find job by ID and update status of matching applicant
    const updatedJob = await Job.findOneAndUpdate(
      { _id: req.params.id, 'applicants._id': applicantId },
      { $set: { 'applicants.$.status': status } },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

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

// Apply for job
router.post('/:id/apply', async (req, res) => {
  const { employeeId } = req.body; // ID of logged-in employee
  const { id } = req.params; // job ID

  try {
    const job = await Job.findById(id);
    const employee = await Employee.findById(employeeId);

    if (!job || !employee) {
      return res.status(404).json({ message: 'Job or Employee not found' });
    }

    // Avoid duplicate applications
    if (job.applicants.includes(employeeId)) {
      return res.status(400).json({ message: 'Already applied' });
    }

    job.applicants.push(employeeId);
    employee.appliedJobs.push(id);

    await job.save();
    await employee.save();

    res.status(200).json({ message: 'Application successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
