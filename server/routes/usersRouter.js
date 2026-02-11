import express from 'express';

// Controller functions
import { loginUser, signupUser } from "../controllers/usersController.js"

const usersRouter = express.Router(); 

// Login route
usersRouter.post("/login", loginUser);

// Signup route
usersRouter.post("/signup", signupUser);


export default usersRouter;