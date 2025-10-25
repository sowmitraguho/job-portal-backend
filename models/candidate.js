import mongoose from "mongoose";

const appliedJobSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
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
    firstName: { type: String },
    lastName: { type: String },
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
    role: { type: String, default: "candidate" },
    profession: { type: String }, //Software Engineer, Web Developer, Marketing Office etc.
    password: { type: String },
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String },
      },
    ],

    experience: [
      {
        company: { type: String },
        position: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        isCurrentlyWorking: { type: Boolean, default: false },
        responsibilities: { type: String },
      },
    ],

    skills: [{ type: String }],

    resume: { type: String },

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