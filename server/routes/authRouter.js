import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Helps prevent CSRF attacks
    maxAge: 3 * 24 * 60 * 60 * 1000,  // Expire in 3 days (matches JWT)
};

// Set up auth Routing
const authRouter = express.Router();

authRouter.get("/google",
    passport.authenticate("google", { scope: ["email", "profile"]} )
);

authRouter.get("/google/callback",
    // Since we dont use cookie session, set session to false
    passport.authenticate("google", {session: false, failureRedirect: "http://localhost:5173/login",}),
    (req, res) => {
        const token = jwt.sign({ _id: req.user._id }, process.env.SECRET, { expiresIn: "3d" });

        res.cookie("token", token, cookieOptions);

        res.redirect(`${process.env.REDIRECT_URL || "http://localhost:5173"}`);
    }
);

export default authRouter;