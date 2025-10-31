import express from 'express';
import Job from '../models/Job.js';
import Candidate from '../models/candidate.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { postJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //  Filters from query params
    const { jobType, workArrangement } = req.query;

    // Build dynamic filter
    const filter = {};
    if (jobType) filter.jobType = jobType;
    if (workArrangement) filter.workArrangement = workArrangement;

    // Fetch filtered + paginated jobs
    const jobs = await Job.find(filter)
      .populate('employer', 'name companyName email')
      .skip(skip)
      .limit(limit)
      .sort({ postedAt: -1 });

    // Total count for pagination (with same filter)
    const totalJobs = await Job.countDocuments(filter);


    res.json({
      page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      hasNextPage: page * limit < totalJobs,
      hasPrevPage: page > 1,
      jobs,
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

// Create job
// router.post('/', async (req, res) => {
//   const job = new Job(req.body);
//   try {
//     const newJob = await job.save();
//     res.status(201).json(newJob);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });
router.post("/", verifyToken, postJob);

// Update job
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { applicant, status, primaryEnquiries } = req.body;
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $push: { applicants: { applicant, status, primaryEnquiries } } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id', verifyToken, async (req, res) => {
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

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: updatedJob,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Apply for job
router.post('/:id/apply', verifyToken, async (req, res) => {
  const { employeeId } = req.body; // ID of logged-in employee
  const { id } = req.params; // job ID

  try {
    const job = await Job.findById(id);
    const employee = await Employee.findById(employeeId);

    if (!job || !employee) {
      return res.status(404).json({ message: 'Job or Employee not found' });
    }

    // Avoid duplicate applications
    const alreadyApplied = job.applicants.some(
      (a) => a.applicant.toString() === employeeId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied' });
    }

    // Push applicant with structure
    job.applicants.push({ applicant: employeeId, status: 'applied' });
    employee.appliedJobs.push(id);

    await job.save();
    await employee.save();

    res.status(200).json({ message: 'Application successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
