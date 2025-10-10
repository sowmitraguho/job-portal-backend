import mongoose from "mongoose";
import dotenv from "dotenv";
import { fakePosts } from "./fakePosts.js";
import CommunityPost from "../models/CommunityPost.js";

dotenv.config();

const seedPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await CommunityPost.insertMany(fakePosts);
        console.log("✅ Posts successfully uploaded!");
        mongoose.connection.close();
    } catch (err) {
        console.error("❌ Error uploading posts:", err);
    }
};

seedPosts();
