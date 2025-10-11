import mongoose from "mongoose";
import dotenv from "dotenv";
import { fakeCandidates } from "./fakeCandidates.js";
import Candidate from "../models/candidate.js";

dotenv.config();

const seedCandidates = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Candidate.insertMany(fakeCandidates);
        console.log("✅ Candidates successfully uploaded!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error uploading candidates:", err);
    }
};

seedCandidates();
