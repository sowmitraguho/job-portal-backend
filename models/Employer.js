import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema(
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
      enum: ['google', 'Email/Password'],
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
    companyName: {
      type: String,
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
    },
    website: {
      type: String,
      default: '',
    },
    address: { type: String },
    companyLogo: {
      type: String,
    },
    industry: {
      type: String,
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
