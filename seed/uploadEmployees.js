import mongoose from "mongoose";
import dotenv from "dotenv";
import { fakeEmployees } from "./fakeEmployees.js";
import Employee from "../models/Employee.js";

dotenv.config();

const seedEmployees = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Employee.insertMany(fakeEmployees);
        console.log("✅ Employees successfully uploaded!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error uploading employees:", err);
    }
};

seedEmployees();
