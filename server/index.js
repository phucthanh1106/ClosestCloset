import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

// Importing routers
import categoriesRouter from "./routes/categoriesRouter.js";
import usersRouter from "./routes/usersRouter.js";

dotenv.config(); // Load the variables from .env
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Mounting middlewares
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);

// Connect to MongoDB
const dbURI = process.env.MONGO_URI;
let isConnected = false;

const connectDB = async (req, res, next) => {
    if (isConnected) return next(); // Skip if already connected

    try {
        await mongoose.connect(dbURI);
        isConnected = true;
        console.log("MongoDB Connected");
        next();
    } catch (err) {
        console.error("Failed to connect to mongoDB: ", err);
        res.status(500).json({ error: "Database connection failed" });
    }
};

connectDB();

export default app;


