import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  skills: [String],
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
