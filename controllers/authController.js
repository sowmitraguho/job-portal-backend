// controllers/authController.js
import jwt from 'jsonwebtoken';
import Employer from '../models/Employer.js';
import Candidate from '../models/candidate.js';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: 'Login successful',
      authToken: token,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const checkUserExist = async (req, res) => {
  const token = req.cookies.authToken; // read from cookie

  if (!token) return res.status(401).json({ message: "No token found" });


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    let user;
    if (role === "employer") {
      user = await Employer.findById(id).select("-password");
    } else if (role === "candidate") {
      user = await Candidate.findById(id).select("-password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const checkLoginStatus = async (req, res) => {
  try {
    const token = req.cookies.authToken; // ✅ Read from cookies

    if (!token) {
      return res.status(401).json({ loggedIn: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    let user;

    switch (role) {
      case "candidate":
        user = await Candidate.findById(id).select("-password");
        break;
      case "employer":
        user = await Employer.findById(id).select("-password");
        break;
      // case "admin":
      //   user = await Admin.findById(id).select("-password");
      //   break;
      default:
        return res.status(200).json({ loggedIn: false, message: "Invalid role" });
    }

    res.status(200).json({
      loggedIn: true,
      user: user,
    });
  } catch (err) {
    res.status(401).json({
      loggedIn: false,
      message: "Invalid or expired token",
    });
  }
};


export const logoutUser = (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: 'Logged out successfully' });
};




// export const googleAuth = async (req, res) => {
//   try {
//     const { token, role } = req.body; // token from frontend + role (e.g. 'candidate' or 'employer')

//     // Verify Google token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture } = payload;
//     const [firstName, ...rest] = name.split(' ');
//     const lastName = rest.join(' ');
//     // Check if user exists in either model
//     let user =
//       (await Employer.findOne({ email })) ||
//       (await Candidate.findOne({ email }));

//     // Create new user if not exists
//     if (!user) {
//       if (role === "employer") {
//         user = new Employer({
//           firstName, lastName,
//           email,
//           profileImage: picture,
//           googleLogin: true,
//         });
//       } else {
//         user = new Candidate({
//           firstName, lastName,
//           email,
//           profileImage: picture,
//           googleLogin: true,
//         });
//       }
//       await user.save();
//     }

//     // Generate your own JWT
//     const jwtToken = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Set cookie
//     res.cookie("authToken", jwtToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: "/",
//     });

//     const userObj = user.toObject();
//     delete userObj.password;

//     res.status(200).json({
//       message: "Google login successful",
//       user: userObj,
//       token: jwtToken,
//     });
//   } catch (err) {
//     console.error("Google login error:", err);
//     res.status(400).json({ message: "Google authentication failed" });
//   }
// };


export const googleAuth = async (req, res) => {
  try {
    const { firstName, lastName, email, profileImage, role } = req.body;

    let user =
      (await Employer.findOne({ email })) ||
      (await Candidate.findOne({ email }));

    if (!user) {
      if (role === "employer") {
        user = new Employer({
          firstName,
          lastName,
          email,
          profileImage,
          googleLogin: true,
        });
      } else {
        user = new Candidate({
          firstName,
          lastName,
          email,
          profileImage,
          googleLogin: true,
        });
      }
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("authToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Google login successful",
      user,
      token: jwtToken,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ message: "Google authentication failed" });
  }
};
