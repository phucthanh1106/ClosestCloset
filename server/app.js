import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';

// Importing schemas
import Categories from "./models/categories.js"


const app = express();
app.use(express.json());
dotenv.config(); // Load the variables from .env

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


// Mongoose and Mongo routes
app.get("/api/categories", async (req, res) => {
    try {
        const categories = await Categories.find().sort({ name: 1});
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});


app.post("/api/categories", async (req, res) => {
    try {
        const category = new Categories(req.body);
        const savedCategory = await category.save();

        res.status(201).json(savedCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


