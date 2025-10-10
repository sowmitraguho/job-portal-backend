import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  role: { type: String, default: 'employer' },
  phone: { type: String },
  website: { type: String },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

const Employer = mongoose.model('Employer', employerSchema);
export default Employer;
