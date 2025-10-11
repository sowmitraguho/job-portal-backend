

import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/Job.js"; // adjust the path to your Job model

// e.g. ["68ea9d2c60dcfae247657ba9", "68ea9d2c60dcfae247658000"]

dotenv.config();

const updateJobApplicants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Example jobId and new applicantIds
    const jobId = "68e94bcb6c45279c3449b291";
    const applicantIds = ["68e946e8054937ba726348c9", "68e946e8054937ba726348c7", "68e946e8054937ba726348c1", "68e946e8054937ba726348cb"]; 

    // Update job with new applicants
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $push: {
          applicants: {
            $each: applicantIds.map(id => ({
              _id: id,
              status: "applied",
              primaryEnquiries: [],
            })),
          },
        },
      },
      { new: true }
    );

    // Update totalApplicants field
    updatedJob.totalApplicants = updatedJob.applicants.length;
    await updatedJob.save();

    console.log("✅ Applicants successfully added!");
    console.log("📄 Updated Job:", updatedJob);

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error updating applicants:", err);
    mongoose.connection.close();
  }
};

updateJobApplicants();
