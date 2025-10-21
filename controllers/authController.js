// controllers/authController.js
import jwt from 'jsonwebtoken';
import Employer from '../models/Employer.js';
import Candidate from '../models/candidate.js';
import bcrypt from 'bcryptjs';

export const loginUser = async (req, res) => {
  const { email, password, googleLogin } = req.body;

  try {
    // Find user from either Employer or Candidate collection
    let user =
      (await Employer.findOne({ email })) || (await Candidate.findOne({ email }));

    if (!user) {
      // If user not found and not Google login, reject
      if (!googleLogin) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If Google login, you can auto-register here if needed
      // (optional)
      return res.status(401).json({ message: 'Google user not registered' });
    }

    // If not Google login, check password
    if (!googleLogin) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    //  Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    //  Set cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: true, // true for HTTPS
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    //  Send response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
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
