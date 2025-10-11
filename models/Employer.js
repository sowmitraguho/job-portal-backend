import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
    },
    LastName: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Employer name is required'],
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['google', 'email', 'github'],
      default: 'email'
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
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyDescription: {
      type: String,
      default: '',
    },
    designation: { type: String, default: '' },
    role: {
      type: String,
      enum: ['employer'],
      default: 'employer',
    },
    phone: {
      type: String,
      match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number'],
    },
    website: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    profileImage: {
      type: String, // URL to image
      default: '',
    },
    companyLogo: {
      type: String, // URL to logo
      default: '',
    },
    industry: {
      type: String,
      default: '',
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '1-10',
    },
    establishedYear: {
      type: Number,
    },
    jobsPosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
    ],
  },
  { timestamps: true }
);

const Employer = mongoose.model('Employer', employerSchema);

export default Employer;
