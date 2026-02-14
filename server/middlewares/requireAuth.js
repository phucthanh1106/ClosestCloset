import jwt from "jsonwebtoken";
import Users from "../models/usersModel.js";

const requireAuth = async (req, res, next) => {
    // Verify authentication
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "Authorization token required "})
    }

    // authorization looks something like "Bearer asdkasndkasndk.nadksni12dn21idna.a1hd9821d9has"
    const token = authorization.split(" ")[1];

    try {
        const {_id} = jwt.verify(token, process.env.SECRET);

        // We will find the user by their id 
        // and then return that id to put it into a property of the request which we can call it anything we want
        // E.g: req.user or req.userId
        req.user = await Users.findOne({ _id }).select("_id");
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Request is not authorized"});
    }
}

export default requireAuth;