import mongoose from 'mongoose';
import express from 'express';
import Employer from '../models/Employer.js';
import Job from '../models/Job.js';
import Candidate from '../models/candidate.js';
import bcrypt from "bcryptjs";
import { verifyToken } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

// Get all employers
router.get('/', async (req, res) => {
    try {
        const admins = await Admin.find();
        res.json(admins);
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

        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });

        return res.json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create employer
router.post('/', async (req, res) => {
    // Check if email already exists in Candidate collection
    const existingCandidate = await Candidate.findOne({ email: req.body.email });
    if (existingCandidate) {
        return res.status(400).json({ message: "Email already registered as Candidate" });
    }
    const existingEmployer = await Employer.findOne({ email: req.body.email });
    if (existingEmployer) return res.status(400).json({ message: 'Email already registered as Employer' });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const admin = new Admin({
        ...req.body,
        password: hashedPassword,
    });
    try {
        const newAdmin = await admin.save();
        const token = jwt.sign(
            { id: newAdmin._id, role: newAdmin.role },
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
        res.status(201).json({ user: newEmployer });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update employer
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAdmin);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete employer
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        await Job.deleteMany({ employer: req.params.id });
        res.json({ message: 'Admin deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



export default router;
