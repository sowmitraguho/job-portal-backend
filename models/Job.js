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
  companyName: { type: String, required: true },
  companyDescription: String,
  status: { type: String, enum: ["Job Ongoing", "Candidate Listing", "Interviewing"] },
  companyGoals: String,
  location: String,
  jobDescription: String,
  jobType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
  workArrangement: { type: String, enum: ['Remote', 'On-site', 'Hybrid'] },
  jobStartDate: Date,
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  salary: { type: mongoose.Schema.Types.Mixed, required: true },
  benefits: [String],
  keyResponsibilities: [String],
  requirements: [String],
  otherRequirements: String,
  skills: [String],
  experienceLevel: {
    level: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Director', 'Executive', 'Internship'], required: false },
    years: { type: Number, min: 0 }
  },
  educationRequirements: { type: String, enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate', 'Not Applicable'], required: true },
  industry: String,
  tags: [String],
  seniorityLevel: { type: String, enum: ['Internship', 'Entry', 'Associate', 'Mid-Senior', 'Senior', 'Director', 'Executive'] },
  primaryEnquiries: [String],
  applicants: [applicantSchema],
  totalApplicants: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
  applicationDeadline: Date
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
