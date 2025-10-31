import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Seed admin function
const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ email: 'admin@jobquest.com' });
        if (existingAdmin) {
            console.log('Admin already exists!');
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10); // hash password

        const admin = new Admin({
            firstName: 'Job',
            lastName: 'Quest',
            email: 'admin@jobquest.com',
            password: hashedPassword,
            designation: 'System Administrator',
            role: 'admin',
            phone: '1234567890',
            profileImage: '', // optional
        });

        await admin.save();
        console.log('Admin seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
