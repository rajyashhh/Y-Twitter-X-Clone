import path from "path";
import express from "express";
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import dotenv from "dotenv"
import connectMongoDB from "./db/connectMongoDB.js";
import cors from 'cors';
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

const app = express();
dotenv.config(); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// Connect to MongoDB immediately (for serverless)
connectMongoDB();

const corsOptions = {
    origin: "*",
    credentials: true
}

app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.use(express.json({limit: "5mb"}));
app.use(cookieParser())

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes)

// Health check endpoint
app.get('/api', (req, res) => {
    res.json({ message: "API is working!" });
});

// Static file serving (removed for serverless)
// The vercel.json handles routing to frontend

// Export the Express app for Vercel serverless functions
export default app;

// Only listen in development/local environment
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
