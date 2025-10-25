import mongoose from 'mongoose';
import express from 'express';
import Employer from '../models/Employer.js';
import Job from '../models/Job.js';
import Candidate from '../models/candidate.js';
import bcrypt from "bcryptjs";
import { verifyToken } from '../middleware/authMiddleware.js';

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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Employer ID format' });
    }

    const employer = await Employer.findById(id).populate('jobsPosted', 'jobTitle');
    if (!employer) return res.status(404).json({ message: 'Employer not found' });

    return res.json(employer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create employer
router.post('/', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const employer = new Employer({
    ...req.body,
    password: hashedPassword,
  });
  try {
    const newEmployer = await employer.save();
    res.status(201).json({ user: newEmployer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update employer
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedEmployer = await Employer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEmployer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete employer
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Employer.findByIdAndDelete(req.params.id);
    await Job.deleteMany({ employer: req.params.id });
    res.json({ message: 'Employer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/applicants', verifyToken, async (req, res) => {
  const { id } = req.params; // employer ID
  const {
    jobId,
    experienceLevel,
    fromDate,
    toDate,
    skills,
    page = 1,
    limit = 10,
    selectedIds, // new query param for selected applicant IDs
  } = req.query;

  try {
    // Step 1: Filter jobs for this employer
    let jobFilter = { employer: id };
    if (jobId) jobFilter._id = jobId;

    const jobs = await Job.find(jobFilter)
      .populate({
        path: 'applicants',
        select: 'name email skills profileImage resume experience education appliedJobs createdAt applicationStatus',
      })
      .exec();

    // Step 2: Filter and paginate applicants
    const paginatedJobs = jobs.map((job) => {
      let applicants = job.applicants;

      // If selectedIds is provided, filter only these applicants
      if (selectedIds) {
        const idsArray = (selectedIds).split(',');
        applicants = applicants.filter((applicant) =>
          idsArray.includes(applicant._id.toString())
        );
      }

      // Filter by experience level
      if (experienceLevel) {
        applicants = applicants.filter((applicant) =>
          applicant.experience.some((exp) => exp.level === experienceLevel)
        );
      }

      // Filter by skills
      if (skills) {
        const skillsArray = (skills).split(',').map((s) => s.trim().toLowerCase());
        applicants = applicants.filter((applicant) =>
          skillsArray.every((skill) =>
            applicant.skills.map((sk) => sk.toLowerCase()).includes(skill)
          )
        );
      }

      // Filter by applied date
      if (fromDate || toDate) {
        const from = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        const to = toDate ? new Date(toDate) : new Date();
        applicants = applicants.filter(
          (applicant) =>
            applicant.appliedJobs.includes(job._id) &&
            applicant.createdAt >= from &&
            applicant.createdAt <= to
        );
      }

      // Pagination
      const totalApplicants = applicants.length;
      const startIndex = ((page) - 1) * (limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedApplicants = applicants.slice(startIndex, endIndex);

      return {
        ...job.toObject(),
        applicants: paginatedApplicants,
        totalApplicants,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplicants / (limit)),
      };
    });

    res.json(paginatedJobs);
  } catch (err) {
    res.status(500).json({ message: (err).message });
  }
});


router.patch('/:id/applicants/bulk', verifyToken, async (req, res) => {
  const { id } = req.params; // employer ID
  const { jobId, applicantIds, action } = req.body;

  if (!jobId || !Array.isArray(applicantIds) || !action) {
    return res.status(400).json({ message: 'jobId, applicantIds, and action are required' });
  }

  try {
    // Validate job ownership
    const job = await Job.findOne({ _id: jobId, employer: id });
    if (!job) return res.status(404).json({ message: 'Job not found or not owned by this employer' });

    // Define action mapping
    const statusMap = {
      shortlist: 'Shortlisted',
      reject: 'Rejected',
      nextRound: 'Interview',
    };

    if (action === 'delete') {
      // Remove applicants from job and employee appliedJobs
      job.applicants = job.applicants.filter(appId => !applicantIds.includes(appId.toString()));
      await job.save();

      await Candidate.updateMany(
        { _id: { $in: applicantIds } },
        { $pull: { appliedJobs: jobId, [`applicationStatus.${jobId}`]: '' } } // remove job from appliedJobs and status
      );

      return res.json({ message: 'Applicants removed successfully' });
    }

    // Update status for selected applicants
    const updateStatus = statusMap[action];
    if (!updateStatus) return res.status(400).json({ message: 'Invalid action' });

    await Candidate.updateMany(
      { _id: { $in: applicantIds } },
      { $set: { [`applicationStatus.${jobId}`]: updateStatus } }
    );

    res.json({ message: `Applicants ${updateStatus.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
