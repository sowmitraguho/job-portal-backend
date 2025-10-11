import mongoose from "mongoose";
import dotenv from "dotenv";
import Employer from "../models/Employer.js"
import {Employers} from "./fakeEmployers.js"

dotenv.config();

const seedEmployers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Employer.insertMany(Employers);
        console.log("✅ Employers successfully uploaded!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error uploading employers:", err);
    }
};

seedEmployers();
