// routes/authRoutes.js
import express from 'express';
import { checkUserExist, checkLoginStatus, loginUser } from '../controllers/authController.js';
const router = express.Router();

router.get('/check-user', checkUserExist);
router.get('/check-login', checkLoginStatus);
router.post('/login', loginUser);

export default router;
