import express from "express";
import authRoutes from "./routes/auth.routes.js"
import dotenv from "dotenv"
import connectMongoDB from "./db/connectMongoDB.js";
import mongoose from "mongoose";
const app = express();
dotenv.config(); 

const PORT = process.env.PORT || 5000;
app.use('/api/auth', authRoutes);

app.use(express.json());

app.get("/", (req,res)=>{
    res.send("Server is ready");
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})