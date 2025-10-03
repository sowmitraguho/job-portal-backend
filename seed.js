import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./models/Job.js";

dotenv.config();

const jobs = [
    {
        "jobTitle": "Frontend Developer",
        "companyName": "TechNova",
        "companyDescription": "A leading SaaS company focused on building scalable web apps.",
        "companyGoals": "To innovate and simplify digital solutions for businesses.",
        "location": "New York, USA",
        "jobDescription": "Develop responsive UI using React and Tailwind.",
        "jobType": "Full-time",
        "workArrangement": "Hybrid",
        "jobStartDate": "2025-11-01",
        "employer": "652b2cfd8f1b2a3e9b123456",
        "salary": { "min": 50000, "max": 70000, "currency": "USD" },
        "benefits": ["Health Insurance", "Paid Time Off", "Remote Work Options"],
        "keyResponsibilities": ["Build UI components", "Collaborate with backend team", "Optimize web performance"],
        "requirements": ["Proficiency in JavaScript", "Experience with React"],
        "otherRequirements": "Knowledge of Git and CI/CD",
        "skills": ["React", "JavaScript", "Tailwind CSS"],
        "experienceLevel": { "level": "Mid", "years": 2 },
        "educationRequirements": "Bachelor",
        "industry": "Software Development",
        "tags": ["frontend", "react", "web"],
        "seniorityLevel": "Associate",
        "applicationDeadline": "2025-12-01"
    },
    {
        "jobTitle": "Data Analyst",
        "companyName": "InsightPro",
        "companyDescription": "Data-driven consultancy helping global clients.",
        "companyGoals": "Transform raw data into actionable insights.",
        "location": "London, UK",
        "jobDescription": "Analyze datasets and prepare dashboards.",
        "jobType": "Full-time",
        "workArrangement": "Remote",
        "jobStartDate": "2025-10-20",
        "employer": "652b2cfd8f1b2a3e9b123457",
        "salary": { "fixed": 45000, "currency": "GBP" },
        "benefits": ["Flexible Hours", "Learning Budget"],
        "keyResponsibilities": ["Data cleaning", "Report generation", "Communicate insights"],
        "requirements": ["SQL knowledge", "Proficiency in Excel"],
        "otherRequirements": "Knowledge of Power BI",
        "skills": ["SQL", "Excel", "Power BI"],
        "experienceLevel": { "level": "Entry", "years": 1 },
        "educationRequirements": "Bachelor",
        "industry": "Consulting",
        "tags": ["data", "analytics"],
        "seniorityLevel": "Entry",
        "applicationDeadline": "2025-11-15"
    },
    {
        "jobTitle": "Backend Engineer",
        "companyName": "CloudSphere",
        "companyDescription": "A startup focused on scalable cloud services.",
        "companyGoals": "Build the most reliable cloud infrastructure.",
        "location": "Berlin, Germany",
        "jobDescription": "Develop APIs and manage server logic.",
        "jobType": "Full-time",
        "workArrangement": "On-site",
        "jobStartDate": "2025-11-10",
        "employer": "652b2cfd8f1b2a3e9b123458",
        "salary": { "min": 60000, "max": 85000, "currency": "EUR" },
        "benefits": ["Stock Options", "Health Insurance"],
        "keyResponsibilities": ["Write secure APIs", "Maintain databases", "Optimize server performance"],
        "requirements": ["Experience with Node.js", "MongoDB knowledge"],
        "skills": ["Node.js", "Express.js", "MongoDB"],
        "experienceLevel": { "level": "Mid", "years": 3 },
        "educationRequirements": "Bachelor",
        "industry": "Cloud Computing",
        "tags": ["backend", "nodejs", "cloud"],
        "seniorityLevel": "Mid-Senior",
        "applicationDeadline": "2025-12-05"
    },
    {
        "jobTitle": "UI/UX Designer",
        "companyName": "DesignCraft",
        "companyDescription": "Creative design studio working with Fortune 500 companies.",
        "companyGoals": "Deliver user-centered design solutions.",
        "location": "Toronto, Canada",
        "jobDescription": "Design intuitive user interfaces.",
        "jobType": "Contract",
        "workArrangement": "Remote",
        "jobStartDate": "2025-10-15",
        "employer": "652b2cfd8f1b2a3e9b123459",
        "salary": { "fixed": 3000, "currency": "CAD", "per": "month" },
        "benefits": ["Remote Work"],
        "keyResponsibilities": ["Design wireframes", "User research", "Collaborate with developers"],
        "requirements": ["Figma expertise", "Portfolio of design work"],
        "skills": ["Figma", "Adobe XD", "UX Research"],
        "experienceLevel": { "level": "Entry", "years": 1 },
        "educationRequirements": "Associate",
        "industry": "Design",
        "tags": ["uiux", "design"],
        "seniorityLevel": "Entry",
        "applicationDeadline": "2025-11-01"
    },
    {
        "jobTitle": "Machine Learning Engineer",
        "companyName": "AIverse",
        "companyDescription": "AI-powered solutions provider.",
        "companyGoals": "To democratize AI applications.",
        "location": "San Francisco, USA",
        "jobDescription": "Build ML pipelines and deploy AI models.",
        "jobType": "Full-time",
        "workArrangement": "Hybrid",
        "jobStartDate": "2025-12-01",
        "employer": "652b2cfd8f1b2a3e9b123460",
        "salary": { "min": 100000, "max": 150000, "currency": "USD" },
        "benefits": ["Stock Options", "Paid Leave", "Free Lunch"],
        "keyResponsibilities": ["Train ML models", "Deploy models to production", "Optimize pipelines"],
        "requirements": ["Python knowledge", "TensorFlow or PyTorch"],
        "skills": ["Python", "TensorFlow", "PyTorch"],
        "experienceLevel": { "level": "Mid", "years": 2 },
        "educationRequirements": "Master",
        "industry": "Artificial Intelligence",
        "tags": ["ml", "ai", "python"],
        "seniorityLevel": "Senior",
        "applicationDeadline": "2026-01-10"
    }
];

async function seedDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        await Job.insertMany(jobs);
        console.log("Jobs inserted successfully");

        mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

seedDB();
