import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidate"
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'applied',
  },
  primaryEnquiries: [String],
})

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  status: { type: String, enum: ["Job Ongoing", "Candidate Listing", "Interviewing"], required: true },
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], required: true },
  workArrangement: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  companyName: { type: String, required: true },
  companyDescription: String,
  companyGoals: String,
  location: String,
  jobDescription: String,
  salary: { type: mongoose.Schema.Types.Mixed, required: true },
  benefits: [String],
  keyResponsibilities: [String],
  requirements: [String, {required: true}],
  otherRequirements: String,
  educationRequirements: { type: String, enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Not Applicable'], },
  skills: [String],
  experienceLevel: {
    level: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Director', 'Executive', 'Internship'], required: false },
    years: { type: Number, min: 0 }
  },
  seniorityLevel: { type: String, enum: ['Internship', 'Entry', 'Associate', 'Mid-Senior', 'Senior', 'Director', 'Executive'] },
  industry: String,
  tags: [String],
  primaryEnquiries: [String],
  applicants: [applicantSchema],
  totalApplicants: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
  jobStartDate: Date,
  applicationDeadline: Date
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;
