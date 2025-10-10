import mongoose from "mongoose";
import dotenv from "dotenv";
import { fakeSubscribers } from "./fakeSubscribers.js";
import subscribers from "../models/Subscribers.js";

dotenv.config();

const seedSubscribers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await subscribers.insertMany(fakeSubscribers);
        console.log("✅ Subscribers successfully uploaded!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error uploading subscribers:", err);
    }
};

seedSubscribers();
