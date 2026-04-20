import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

// Importing routers
import categoriesRouter from "./routes/categoriesRouter.js";
import usersRouter from "./routes/usersRouter.js";

dotenv.config(); // Load the variables from .env
const app = express();
const port = process.env.PORT || 4000 

app.use(cors({
    origin: ["https://closestcloset.onrender.com", "https://closestcloset-frontend.onrender.com"]
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Mounting middlewares
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);

// Connect to MongoDB
const dbURI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        // Wait for the database connection to succeed
        await mongoose.connect(dbURI);
        console.log("Successfully connected to db");

        // If connection is successful, start the server since we dont want our server to listen for request until the connection to db
        app.listen(port, "0.0.0.0");
        console.log("Server starts listening for requests");
    } catch (err) {
        console.error("Failed to connect to mongoDB: ", err);
    }
};

connectDB();

export default app;


