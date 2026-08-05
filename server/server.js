import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { createServer } from "node:http"; // createServer creates the real HTTP server. Express and Socket.IO will share it:
import { Server } from "socket.io";

// Authentication & Routers
import passport from "./config/passport.js"
import categoriesRouter from "./routes/categoriesRouter.js";
import usersRouter from "./routes/usersRouter.js";
import authRouter from "./routes/authRouter.js";

// External services
import { connectRedis } from "./services/redisClient.js";
import { initializeSocket } from "./sockets/socketServer.js";

// Loading env vars 
dotenv.config(); // Load the variables from .env

const allowedOrigins = [         
    "https://closestcloset.onrender.com",
    "http://localhost:5173",
];

// Initiating Express and the shared HTTP server for Socket.io engine
const app = express(); // Express handles routes & logic
const httpServer = createServer(app); // createServer creates the real HTTP server
const io = initializeSocket(httpServer, allowedOrigins); // Initialize socket connection

// Standard Global Middlewares
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Mounting middlewares
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter)

// Starting the server with connecting to mongoDB and Redis
const dbURI = process.env.MONGO_URI;
const port = process.env.PORT || 4000 
const startServer = async () => {
    try {
        // Wait for the database connection to succeed
        await mongoose.connect(dbURI);
        console.log("Successfully connected to MongoDB");

        // After mongodb's connection went through, start connecting to redis
        await connectRedis();

        // If connection is successful, start the server since we dont want our server to listen for request until the connection to db
        httpServer.listen(port, "0.0.0.0");
        console.log("Server starts listening for requests");
    } catch (err) {
        console.error("Failed to connect to mongoDB: ", err);
    }
};

startServer();

export default app;


