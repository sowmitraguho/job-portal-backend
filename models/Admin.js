import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        profileImage: {
            type: String
        },
        authProvider: {
            type: String,
            enum: ['google', 'Email/Password', 'github'],
            default: 'Email/Password'
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+\@.+\..+/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
        },
        designation: { type: String, default: '' },
        role: {
            type: String,
            enum: ['admin'],
            default: 'admin',
        },
        phone: {
            type: String,
        },
        
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
