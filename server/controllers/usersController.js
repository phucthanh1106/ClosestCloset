import Users from "../models/usersModel.js"
import jwt from "jsonwebtoken";

// Create JWT
const createToken = (_id) => {
    // Three arguments for sign function:
    // 1. object that represents payload
    // 2. secret string that only knows by the server (dont public this)
    // 3. Some options for this token
    // i.e. the number of days that the user remains logged in before the token is expired
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' } )
}


// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!process.env.SECRET) {
            return res.status(500).json({error: "Server configuration error: SECRET not set"});
        }

        const user = await Users.login(email, password);

        // create token
        const token = createToken(user._id);
        const id = user._id.toString();

        res.status(200).json({email, id, token});
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

        res.status(200).json({email, id, token});
    } catch (error) {   
        res.status(400).json({error: error.message})
    }
}
