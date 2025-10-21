import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import jobRoutes from './routes/jobs.js';
import employerRoutes from './routes/employers.js';
import candidateRoutes from './routes/candidates.js';
import subscribeRoutes from './routes/subscribe.js';
import reviewRoutes from './routes/review.js';
import comminuty from './routes/community.js'
import authRoutes from './routes/authRoutes.js'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://job-quest-frontend-lemon.vercel.app", "https://job-quest-frontend-phi.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Middleware for parsing cookies
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/community', comminuty);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Job Portal API is running');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
