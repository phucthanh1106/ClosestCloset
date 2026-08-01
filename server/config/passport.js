import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";
import Users from "../models/usersModel.js";
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    // 1. Configure the Strategy with your app's credentials
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
        passReqToCallback: true
    },
    // 2. Passport automatically exchanges the Authorization Code for tokens!
    // It gives you access Token and profile data right here:
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            // Find or create user in your database (MongoDB, Postgres, etc.)
            const userEmail = profile.email;

            if (!userEmail) {
                return done(new Error("No email found from Google profile"), null);
            }

            // Search mongoDb for existing user by email to avoid duplicating accounts
            let user = await Users.findOne({ email: userEmail });

            if (user) {
                // If user already exists, log them in using their email and password

                // Link their googleId to their user schema
                if (!user.googleId) {
                    user.googleId = profile.id;
                    // Optionally grab their google profile picture if they don't have an avatar
                    // if (!user.avatar) {
                    //     user.avatar = profile.photos?.[0]?.value;
                    // }
                }

                // Link their authProvider to their user schema
                if (!user.authProvider) {
                    user.authProvider = "google";
                }

                // Save the new updated to database
                await user.save();

                // Return existing user => logs them in
                // done is a callback function that tells Passport your custom strategy verification logic is finished.
                return done(null, user);
            } else {
                // If user does not exist at all, create a new OAuth user
                user = await Users.create({
                    email: userEmail,
                    googleId: profile.id,
                    authProvider: "google",
                });

                return done(null, user);
            }
        } catch (error) {
            return done(error, null)
        }
    }
))

passport.use(
    new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:4000/api/auth/github/callback",
        scope: 'user:email' // Needed for accessing email of the user
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userEmail = profile.emails[0].value;
            console.log(userEmail)

            if (!userEmail) {
                return done(new Error("No email found from GitHub profile"), null);
            }

            let user = await Users.findOne({ githubId: profile.id });

            if (!user) {
                user = await Users.findOne({ email: userEmail });
            }

            if (user) {
                if (!user.githubId) {
                    user.githubId = profile.id;
                }

                if (!user.authProvider) {
                    user.authProvider = "github";
                }

                await user.save();

                return done(null, user);
            }

            user = await Users.create({
                email: userEmail,
                githubId: profile.id,
                authProvider: "github",
            });

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    })
);

export default passport;