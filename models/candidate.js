import mongoose from "mongoose";

const appliedJobSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'applied',
  },
  primaryEnquiries: [String],
}, { _id: false }); // optional to skip auto _id for subdocs

const candidateSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    authProvider: {
      type: String,
      enum: ['google', 'email', 'github'],
      default: 'email'
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    profileImage: { type: String },
    address: { type: String },
    bio: { type: String, maxlength: 500 },
    role: { type: String, default: "employee" },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String },
      },
    ],

    experience: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date }, // optional — may not exist
        isCurrentlyWorking: { type: Boolean, default: false }, // new field
        responsibilities: { type: String },
      },
    ],

    skills: [{ type: String }],

    resume: { type: String }, // optional resume URL or file path

    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
      website: { type: String },
    },

    appliedJobs: [appliedJobSchema],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;