import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: "none", // Helps prevent CSRF attacks
    maxAge: 1 * 24 * 60 * 60 * 1000,  // Expire in 1 days (matches JWT)
};

// Set up auth Routing
const authRouter = express.Router();

// GOOGLE OAUTH
// The first parameter in passport.authenticate() is the Strategy Name (a string identifier).
authRouter.get("/google",
    // Scope means permission that our app is allowed to get
    passport.authenticate("google", { scope: ["email", "profile"]} )
);

authRouter.get("/google/callback",
    // Since we dont use cookie session, set session to false
    passport.authenticate("google", {session: false, failureRedirect: `${process.env.REDIRECT_URL || "http://localhost:5173"}/login`}), (req, res) => {
        const token = jwt.sign({ _id: req.user._id }, process.env.SECRET, { expiresIn: "1d" });

        res.cookie("token", token, cookieOptions);

        res.redirect(`${process.env.REDIRECT_URL || "http://localhost:5173"}`);
    }
);

// GITHUB OAUTH
authRouter.get("/github",
    // Scope means permission that our app is allowed to get
    passport.authenticate("github", { scope: ["user:email"] })
);

authRouter.get("/github/callback",
    // Since we dont use cookie session, set session to false
    passport.authenticate("github", {session: false, failureRedirect: `${process.env.REDIRECT_URL || "http://localhost:5173"}/login`}), (req, res) => {
        const token = jwt.sign({ _id: req.user._id }, process.env.SECRET, { expiresIn: "1d" });

        res.cookie("token", token, cookieOptions);

        res.redirect(`${process.env.REDIRECT_URL || "http://localhost:5173"}`);
    }
);


export default authRouter;