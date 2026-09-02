import Users from "../models/usersModel.js"
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

// Configure cookie options
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax" , // lax for development where client and server same domain but none
    maxAge: 3 * 24 * 60 * 60 * 1000,
};

// Create JWT
const createToken = (_id) => {
    // Three arguments for sign function:
    // 1. object that represents payload
    // 2. secret string that only knows by the server (dont public this)
    // 3. Some options for this token
    // i.e. the number of days that the user remains logged in before the token is expired
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '1d' })
}

// Return user to frontend
export const returnUser = async (req, res) => {
    res.status(200).json({
        id: req.user._id,
        email: req.user.email,
    });
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!process.env.SECRET) {
            return res.status(500).json({error: "Server configuration error: SECRET not set"});
        }

        const user = await Users.login(email, password);
        const id = user._id.toString();
        const token = createToken(id);

        res.cookie("token", token, cookieOptions);

        res.status(200).json({email, id});
    } catch (error) {   
        res.status(400).json({error: error.message})
    }
}


// Signup user
export const signupUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!process.env.SECRET) {
            return res.status(500).json({error: "Server configuration error: SECRET not set"});
        }

        const user = await Users.signup(email, password);

        // create token
        const token = createToken(user._id);
        const id = user._id.toString();

        res.cookie("token", token, cookieOptions);

        res.status(200).json({email, id});
    } catch (error) {   
        res.status(400).json({error: error.message})
    }
}

// Log out
export const logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
    });

    res.status(200).json({
        message: "Logged out successfully",
    });
};
