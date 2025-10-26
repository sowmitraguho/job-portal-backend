// routes/authRoutes.js
import express from 'express';
import { checkUserExist, checkLoginStatus, loginUser, logoutUser, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.get('/check-user', checkUserExist);
router.get('/check-login', checkLoginStatus);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post("/google", googleAuth);

export default router;
