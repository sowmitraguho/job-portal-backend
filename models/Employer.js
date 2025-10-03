import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

const Employer = mongoose.model('Employer', employerSchema);
export default Employer;
