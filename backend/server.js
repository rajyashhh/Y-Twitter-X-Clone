import express from "express";
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectMongoDB from "./db/connectMongoDB.js";
import mongoose from "mongoose";
import cors from 'cors';
import cookieParser from "cookie-parser";
const app = express();
dotenv.config(); 

const PORT = 3000;


const corsOptions = {
    // methods : ["GET","POST"],
    origin: "*",
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser())

app.get("/", (req,res)=>{
    console.log("req received")
    res.send("Server is ready");
})

app.use('/api/auth', authRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})