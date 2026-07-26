import express from 'express';

// Controller functions
import { loginUser, logoutUser, returnUser, signupUser } from "../controllers/usersController.js"
import requireAuth from '../middlewares/requireAuth.js';

const usersRouter = express.Router(); 

// This lets the frontend ask the backend whether the cookie is valid
// requireAuth is a middleware that attach the property user to req so returnUser can have access to it
usersRouter.get("/me", requireAuth, returnUser)

// Login route
usersRouter.post("/login", loginUser);

// Signup route
usersRouter.post("/signup", signupUser);

// Logout route
usersRouter.post("/logout", logoutUser)

export default usersRouter;