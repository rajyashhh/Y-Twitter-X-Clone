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

// UPDATED: Comprehensive path detection for Render
if (process.env.NODE_ENV === "production") {
    // Try multiple possible paths where the frontend might be
    const possiblePaths = [
        path.join(__dirname, "../frontend/dist"),  // Original attempt
        path.join(__dirname, "frontend/dist"),     // If in project root
        path.join(__dirname, "../dist"),           // If dist is moved up
        path.join(process.cwd(), "frontend/dist"), // Using process.cwd()
        "/opt/render/project/frontend/dist",       // Absolute path
        path.join(process.cwd(), "dist")           // If dist is in root
    ];
    
    let frontendDistPath = null;
    let indexPath = null;
    
    console.log("=== FRONTEND PATH DETECTION ===");
    console.log("Current working directory:", process.cwd());
    console.log("__dirname:", __dirname);
    
    // Show what's in the current directory
    try {
        const currentDir = fs.readdirSync(process.cwd());
        console.log("Contents of current directory:", currentDir);
        
        if (currentDir.includes('frontend')) {
            try {
                const frontendDir = fs.readdirSync(path.join(process.cwd(), 'frontend'));
                console.log("Contents of frontend directory:", frontendDir);
            } catch (e) {
                console.log("Could not read frontend directory:", e.message);
            }
        }
    } catch (e) {
        console.log("Could not read current directory:", e.message);
    }
    
    // Find the correct path
    console.log("Testing possible frontend paths...");
    for (const testPath of possiblePaths) {
        const testIndexPath = path.join(testPath, "index.html");
        const distExists = fs.existsSync(testPath);
        const indexExists = fs.existsSync(testIndexPath);
        
        console.log(`📁 ${testPath} - dist: ${distExists}, index: ${indexExists}`);
        
        if (distExists && indexExists) {
            frontendDistPath = testPath;
            indexPath = testIndexPath;
            console.log(`✅ Found frontend at: ${frontendDistPath}`);
            break;
        }
    }
    
    if (frontendDistPath && indexPath) {
        console.log("✅ Frontend build found, serving static files");
        console.log("Static files will be served from:", frontendDistPath);
        
        app.use(express.static(frontendDistPath));
        
        app.get("*", (req, res) => {
            // Don't serve static files for API routes
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ message: "API route not found" });
            }
            
            try {
                console.log(`Serving index.html for: ${req.path}`);
                res.sendFile(indexPath);
            } catch (error) {
                console.error("Error serving index.html:", error);
                res.status(500).json({ error: "Failed to serve frontend" });
            }
        });
    } else {
        console.log("⚠️ Frontend build not found at any expected location");
        
        // Fallback when frontend is not built
        app.get("*", (req, res) => {
            if (req.path.startsWith('/api/')) {
                return res.status(404).json({ message: "API route not found" });
            }
            
            res.status(503).json({ 
                message: "Frontend not available",
                error: "Frontend build not found at any expected locations",
                api_status: "API is working",
                debug_info: {
                    current_dir: process.cwd(),
                    dirname: __dirname,
                    searched_paths: possiblePaths,
                    current_dir_contents: (() => {
                        try {
                            return fs.readdirSync(process.cwd());
                        } catch (e) {
                            return "Could not read directory";
                        }
                    })()
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
    console.log("=== SERVER STARTUP INFO ===");
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`📁 Current directory: ${process.cwd()}`);
    console.log(`📁 __dirname: ${__dirname}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api`);
    console.log("===============================");
});
