import path from "path";
import fs from "fs";  // Add this import for file system checks
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

// UPDATED: Add proper error handling for static file serving
if (process.env.NODE_ENV === "production") {
    const frontendDistPath = path.join(__dirname, "../frontend/dist");
    const indexPath = path.join(frontendDistPath, "index.html");
    
    console.log("Checking frontend paths:");
    console.log("Frontend dist path:", frontendDistPath);
    console.log("Index.html path:", indexPath);
    console.log("Frontend dist exists:", fs.existsSync(frontendDistPath));
    console.log("Index.html exists:", fs.existsSync(indexPath));
    
    // Check if frontend build exists
    if (fs.existsSync(frontendDistPath) && fs.existsSync(indexPath)) {
        console.log("✅ Frontend build found, serving static files");
        app.use(express.static(frontendDistPath));
        
        app.get("*", (req, res) => {
            // Don't serve static files for API routes
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ message: "API route not found" });
            }
            
            try {
                res.sendFile(indexPath);
            } catch (error) {
                console.error("Error serving index.html:", error);
                res.status(500).json({ error: "Failed to serve frontend" });
            }
        });
    } else {
        console.log("⚠️ Frontend build not found, serving API only");
        console.log("Run 'npm run build' to build the frontend");
        
        // Fallback when frontend is not built
        app.get("*", (req, res) => {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ message: "API route not found" });
            }
            
            res.status(503).json({ 
                message: "Frontend not available",
                error: "Frontend build not found",
                instructions: "Run 'npm run build' to build the frontend",
                api_status: "API is working",
                paths_checked: {
                    dist_path: frontendDistPath,
                    index_path: indexPath,
                    dist_exists: fs.existsSync(frontendDistPath),
                    index_exists: fs.existsSync(indexPath)
                }
            });
        });
    }
} else {
    // Development mode
    app.get("*", (req, res) => {
        if (req.path.startsWith('/api/')) {
            return res.status(404).json({ message: "API route not found" });
        }
        res.json({ 
            message: "Development server running",
            note: "Frontend should be running on a separate port (usually 5173)"
        });
    });
}

// FIXED: Always listen in production (Render requires this)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`📁 Current directory: ${__dirname}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api`);
});
