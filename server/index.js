import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';

// Importing routers
import categoriesRouter from "./routes/categoriesRouter.js";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mounting middlewares
app.use("/api/categories", categoriesRouter);

// Connect to MongoDB
dotenv.config(); // Load the variables from .env
const dbURI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        // Wait for the database connection to succeed
        await mongoose.connect(dbURI);

        // If connection is successful, start the server
        app.listen(4000);
    } catch (err) {
        console.error("Failed to connect to mongoDB: ", err);
    }
};

connectDB();


