import mongoose from "mongoose";
import dotenv from "dotenv";
import { fakeReviews } from "./fakeReview.js";
import Review from "../models/Reviews.js";

dotenv.config();

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Review.insertMany(fakeReviews);
        console.log("✅ Reviews successfully uploaded!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error uploading reviews:", err);
    }
};

seedReviews();
