import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                error: "Unauthorized: No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized: Invalid Token"
            });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Check if the token's session version matches the user's current session version
        if (decoded.sessionVersion !== user.sessionVersion) {
            return res.status(401).json({
                error: "Session expired. Please login again."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protected route", error.message);
        return res.status(500).json({
            error: "Internal Server error"
        });
    }
};

export default protectedRoute;