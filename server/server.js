import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

// Importing OAuth
import passport from "./config/passport.js"

// Importing routers
import categoriesRouter from "./routes/categoriesRouter.js";
import usersRouter from "./routes/usersRouter.js";
import authRouter from "./routes/authRouter.js";

// Importing redis
import { connectRedis } from "./services/redisClient.js";

// Loading env vars
dotenv.config(); // Load the variables from .env

// Initiating the app
const app = express();

// Parse incoming cookies into req.cookies
app.use(cookieParser());

app.use(cors({
    origin: ["https://closestcloset.onrender.com", "http://localhost:5173"],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Mounting middlewares
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter)

// Connect to MongoDB
const dbURI = process.env.MONGO_URI;
const port = process.env.PORT || 4000 
const connectDB = async () => {
    try {
        // Wait for the database connection to succeed
        await mongoose.connect(dbURI);
        console.log("Successfully connected to MongoDB");

        // After mongodb's connection went through, start connecting to redis
        await connectRedis();

        // If connection is successful, start the server since we dont want our server to listen for request until the connection to db
        app.listen(port, "0.0.0.0");
        console.log("Server starts listening for requests");
    } catch (err) {
        console.error("Failed to connect to mongoDB: ", err);
    }
};

connectDB();

export default app;


