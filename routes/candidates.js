import express from 'express';
import Candidate from '../models/candidate.js';
import Job from '../models/Job.js';
import bcrypt from "bcryptjs";
import { verifyToken } from '../middleware/authMiddleware.js';
import Employer from '../models/Employer.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get all candidates   
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch candidates with pagination
        const candidates = await Candidate.find()
            .select('-password')
            .populate('appliedJobs.job', 'jobTitle companyName')
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

// GET /candidate/applied-jobs
router.get('/applied-jobs', verifyToken, async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.user.id)
            .select('appliedJobs') // only appliedJobs field
            .populate({
                path: 'appliedJobs.job',      // populate the job field inside appliedJobs
                select: 'jobTitle companyName location salary description requirements', // fields to include
            });

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        res.json({ appliedJobs: candidate.appliedJobs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /candidate/saved-jobs
router.get('/saved-jobs', verifyToken, async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.user.id)
            .select('savedJobs') // only savedJobs field
            .populate({
                path: 'savedJobs',            // savedJobs is an array of Job IDs
                select: 'jobTitle companyName location salary description requirements', // fields to include
            });

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        res.json({ savedJobs: candidate.savedJobs });
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
            .select('firstName lastName email phone appliedJobs');

        if (!candidates.length) {
            return res.status(404).json({ message: 'No candidates found for this job' });
        }

        res.json(candidates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get single Candidate
router.get('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('appliedJobs.job', 'jobTitle companyName');
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        res.json(candidate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//  GET Applied Jobs

router.get("/:id/applied-jobs", verifyToken, async (req, res) => {
    try {
        const candidateId = req.params.id;

        // Find candidate and populate appliedJobs.job to access job details
        const candidate = await Candidate.findById(candidateId)
            .populate("appliedJobs.job", "jobTitle companyName");

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Build the response list
        const appliedJobs = candidate.appliedJobs.map((applied) => ({
            jobId: applied.job?._id,
            jobTitle: applied.job?.jobTitle,
            companyName: applied.job?.companyName,
            status: applied.status,
            primaryEnquiries: applied.primaryEnquiries || [],
        }));

        res.json(appliedJobs);
    } catch (error) {
        console.error("Error fetching applied jobs:", error);
        res.status(500).json({ message: "Server error" });
    }
});


//  GET Saved Jobs

router.get("/:id/saved-jobs", verifyToken, async (req, res) => {
    try {
        const candidateId = req.params.id;

        const candidate = await Candidate.findById(candidateId)
            .populate("savedJobs", "jobTitle companyName");

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        const savedJobs = candidate.savedJobs.map((job) => ({
            jobId: job._id,
            jobTitle: job.jobTitle,
            companyName: job.companyName,
        }));

        res.json(savedJobs);
    } catch (error) {
        console.error("Error fetching saved jobs:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// Create candidate
router.post('/', async (req, res) => {
    const existing = await Candidate.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    // Check if email exists in Employer collection
    const existingEmployer = await Employer.findOne({ email: req.body.email });
    if (existingEmployer) {
        return res.status(400).json({ message: "Email already registered as Employer" });
    }

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
        const token = jwt.sign(
            { id: newCandidate._id, role: newCandidate.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        //  Set cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
        });
        res.status(201).json({ user: newCandidate, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



// UPDATE candidate but DO NOT allow: appliedJobs, savedJobs, role
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const forbiddenFields = ["appliedJobs", "savedJobs", "role"];

        // Remove forbidden fields from req.body if sent
        forbiddenFields.forEach((field) => {
            if (req.body[field]) {
                delete req.body[field];
            }
        });

        const updatedCandidate = await Candidate.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updatedCandidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        res.json({
            message: "Candidate updated successfully",
            candidate: updatedCandidate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Update Candidate job application (prevent duplicates)
// router.put('/:id/apply', verifyToken, async (req, res) => {
//     try {
//         const { job, status, primaryEnquiries } = req.body;

//         if (!job) {
//             return res.status(400).json({ message: "job field is required" });
//         }

//         // ✅ Fetch candidate first
//         const candidate = await Candidate.findById(req.params.id);

//         if (!candidate) {
//             return res.status(404).json({ message: "Candidate not found" });
//         }

//         // ✅ Check if job is already applied
//         const alreadyApplied = candidate.appliedJobs.some(
//             (item) => item.job.toString() === job
//         );

//         if (alreadyApplied) {
//             return res.status(400).json({ message: "Job already applied" });
//         }

//         // ✅ Add new application
//         candidate.appliedJobs.push({
//             job,
//             status: status || 'applied',
//             primaryEnquiries: primaryEnquiries || []
//         });

//         await candidate.save();

//         res.json({
//             message: "Job applied successfully",
//             appliedJobs: candidate.appliedJobs
//         });

//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });
router.post("/:candidateId/apply/:jobId", verifyToken, async (req, res) => {
    const { candidateId, jobId } = req.params;
    const { status, primaryEnquiries } = req.body;

    try {
        // ✅ Fetch job & candidate
        const job = await Job.findById(jobId);
        const candidate = await Candidate.findById(candidateId);

        if (!job || !candidate) {
            return res.status(404).json({ message: "Job or Candidate not found" });
        }

        /* ------------------------------------------
           CHECK DUPLICATE ON JOB SIDE
        ---------------------------------------------*/
        const jobAlreadyApplied = job.applicants.some(
            (a) => a.applicant.toString() === candidateId
        );

        if (jobAlreadyApplied) {
            return res.status(400).json({ message: "Already applied to this job" });
        }

        /* ------------------------------------------
           CHECK DUPLICATE ON CANDIDATE SIDE
        ---------------------------------------------*/
        const candidateAlreadyApplied = candidate.appliedJobs.some(
            (j) => j.job.toString() === jobId
        );

        if (candidateAlreadyApplied) {
            return res.status(400).json({ message: "Job already exists in applied list" });
        }

        /* ------------------------------------------
           ✅ Update JOB collection
        ---------------------------------------------*/
        job.applicants.push({
            applicant: candidateId,
            status: "applied"
        });

        /* ------------------------------------------
           ✅ Update CANDIDATE collection
        ---------------------------------------------*/
        candidate.appliedJobs.push({
            job: jobId,
            status: status || "applied",
            primaryEnquiries: primaryEnquiries || []
        });

        await job.save();
        await candidate.save();

        res.status(200).json({
            message: "Application successful",
            jobApplicants: job.applicants,
            candidateAppliedJobs: candidate.appliedJobs
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Update savedJobs (add/remove) with duplicate check
router.put("/:id/savedjobs", async (req, res) => {
    try {
        const { jobId, action } = req.body;

        if (!jobId || !action) {
            return res.status(400).json({ message: "jobId and action are required" });
        }

        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // ✅ Check for duplicates when adding
        if (action === "add") {
            if (candidate.savedJobs.includes(jobId)) {
                return res.status(400).json({ message: "Job already added" });
            }

            candidate.savedJobs.push(jobId);
            await candidate.save();

            return res.json({ message: "Job saved successfully", savedJobs: candidate.savedJobs });
        }

        // ✅ Handle remove
        else if (action === "remove") {
            candidate.savedJobs = candidate.savedJobs.filter(
                (saved) => saved.toString() !== jobId
            );
            await candidate.save();

            return res.json({ message: "Job removed successfully", savedJobs: candidate.savedJobs });
        }

        else {
            return res.status(400).json({ message: "Invalid action. Use add/remove." });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
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
