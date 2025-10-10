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

// Get all applicants of employer's jobs with filters
router.get('/:id/applicants', async (req, res) => {
  const { id } = req.params; // employer ID
  const { jobId, experienceLevel, fromDate, toDate, skills } = req.query;

  try {
    // Step 1: Find all jobs of the employer
    let jobFilter = { employer: id };
    if (jobId) jobFilter._id = jobId;

    const jobs = await Job.find(jobFilter)
      .populate({
        path: 'applicants',
        select: 'name email skills profileImage resume experience education appliedJobs',
      })
      .exec();

    // Step 2: Filter applicants inside jobs
    const filteredJobs = jobs.map(job => {
      let applicants = job.applicants;

      // Filter by experience level
      if (experienceLevel) {
        applicants = applicants.filter(applicant =>
          applicant.experience.some(exp => exp.level === experienceLevel)
        );
      }

      // Filter by skills
      if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
        applicants = applicants.filter(applicant =>
          skillsArray.every(skill => applicant.skills.map(sk => sk.toLowerCase()).includes(skill))
        );
      }

      // Filter by application date
      if (fromDate || toDate) {
        const from = fromDate ? new Date(fromDate) : new Date('1970-01-01');
        const to = toDate ? new Date(toDate) : new Date();
        applicants = applicants.filter(applicant =>
          applicant.appliedJobs.includes(job._id) && // only those who applied to this job
          applicant.updatedAt >= from && applicant.updatedAt <= to
        );
      }

      return { ...job.toObject(), applicants };
    });

    res.json(filteredJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
