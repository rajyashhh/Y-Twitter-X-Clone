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

// FIXED: Use Render's PORT with proper fallback
const PORT = process.env.PORT || 10000;
const __dirname = path.resolve();

// Connect to MongoDB
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

// FIXED: Add static file serving for production (Render needs this)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    app.get("*", (req, res) => {
        // Don't serve static files for API routes
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: "API route not found" });
        }
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    });
}

// FIXED: Always listen in production (Render requires this)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Remove the export default for Render deployment
// export default app;  // This is for Vercel, not Render
