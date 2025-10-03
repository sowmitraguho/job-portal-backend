import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
  location: String,
  salary: Number,
  requirements: [String],
  postedAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
