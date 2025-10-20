// controllers/authController.js
import jwt from 'jsonwebtoken';
import Employer from '../models/Employer.js';
import Candidate from '../models/candidate.js';
import bcrypt from 'bcryptjs';

export const loginUser = async (req, res) => {
  const { email, password, googleLogin } = req.body;

  try {
    let user =
      (await Employer.findOne({ email })) || (await Candidate.findOne({ email }));

    if (!user) {
      // If user is coming from Google and not in DB — auto-register or reject
      if (!googleLogin) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    

    // ✅ Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Send JWT to client
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, role: user.role, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const checkUserExist = async (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const employer = await Employer.findOne({ email });
    const candidate = await Candidate.findOne({ email });

    if (employer) return res.status(200).json({ user: employer, exists: true, role: 'employer' });
    if (candidate) return res.status(200).json({ user: candidate, exists: true, role: 'candidate' });

    res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


export const checkLoginStatus = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ loggedIn: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(401).json({ loggedIn: false, message: 'Invalid or expired token' });
  }
};
