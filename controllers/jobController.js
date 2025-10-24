import Job from "../models/Job.js";
import Employer from "../models/Employer.js";

export const postJob = async (req, res) => {
  try {
    const employerId = req.user?.id;

    if (!employerId) {
      return res.status(401).json({ message: "Unauthorized: Employer ID not found" });
    }

    const {
      jobTitle,
      companyName,
      companyDescription,
      status,
      companyGoals,
      location,
      jobDescription,
      jobType,
      workArrangement,
      jobStartDate,
      salary,
      benefits,
      keyResponsibilities,
      requirements,
      otherRequirements,
      skills,
      experienceLevel,
      educationRequirements,
      industry,
      tags,
      seniorityLevel,
      primaryEnquiries,
      applicationDeadline,
    } = req.body;

    // Create a new job
    const newJob = new Job({
      jobTitle,
      companyName,
      companyDescription,
      status,
      companyGoals,
      location,
      jobDescription,
      jobType,
      workArrangement,
      jobStartDate,
      salary,
      benefits,
      keyResponsibilities,
      requirements,
      otherRequirements,
      skills,
      experienceLevel,
      educationRequirements,
      industry,
      tags,
      seniorityLevel,
      primaryEnquiries,
      applicationDeadline,
      employer: employerId, // link the employer
    });

    const savedJob = await newJob.save();
    await Employer.findByIdAndUpdate(employerId, {
      $push: { jobsPosted: savedJob._id },
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const savedJob = await newJob.save({ session });
      await Employer.findByIdAndUpdate(employerId, { $push: { jobsPosted: savedJob._id } }, { session });
      await session.commitTransaction();
      res.status(201).json({ message: "Job posted successfully", job: savedJob });
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: "Server error", error: error.message });
    } finally {
      session.endSession();
    }

    res.status(201).json({
      message: "Job posted successfully",
      job: savedJob,
    });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
