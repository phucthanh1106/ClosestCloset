import jwt from "jsonwebtoken";
import Users from "../models/usersModel.js";

const requireAuth = async (req, res, next) => {
    // 1. Read token from req.cookies (populated by cookie-parser)
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            error: "Authentication required",
        });
    }

    try {
        const {_id} = jwt.verify(token, process.env.SECRET);

        // We will find the user by their id 
        // req.user will be something like
        // {
        //     "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
        //     "email": "student@skidmore.edu"
        // }
        req.user = await Users.findOne({ _id }).select("_id email");

        if (!req.user) {
            return res.status(401).json({error: "User not found"});
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Request is not authorized"});
    }
}

export default requireAuth;
