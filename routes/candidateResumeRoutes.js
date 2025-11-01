import express from "express";
import multer from "multer";
import path from "path";
import Candidate from "../models/candidate.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes/"); // folder to save resumes
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + "-" + Date.now() + ext);
  },
});

// ✅ File filter (PDF, PNG, JPG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|png|jpg|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PNG, JPG files are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// ✅ Upload Resume
router.post("/upload", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    candidate.resume = req.file.path; // save path in DB
    await candidate.save();

    res.json({
      message: "Resume uploaded successfully",
      resumePath: req.file.path,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET candidate resume
router.get("/:candidateId", verifyToken, async (req, res) => {
  try {
    const { candidateId } = req.params;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate || !candidate.resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Send the file path
    res.json({ resumeUrl: `/${candidate.resume.replace(/\\/g, "/")}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
