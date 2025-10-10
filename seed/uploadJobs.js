import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/Job.js";
import { fakeJobs } from "./fakeJobs.js";
dotenv.config();



async function seedJobs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        await Job.insertMany(fakeJobs);
        console.log("Jobs inserted successfully");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

seedJobs();
