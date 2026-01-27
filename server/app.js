import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';

// Importing routers
import categoriesRouter from "./routes/categoriesRouter.js";

const app = express();
app.use(express.json());
dotenv.config(); // Load the variables from .env

// Mounting middlewares
app.use("/api/categories", categoriesRouter);

// Connect to MongoDB
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


