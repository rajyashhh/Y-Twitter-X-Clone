
import z from "zod";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import User from '../models/user.model.js';
import nodemailer from "nodemailer";

const signup = async (req, res) => {
  try {
    const {fullName, username, email, password}=req.body;
    const requiredBody = z.object({
        email : z.string().min(5).max(100).email(),
        password : z.string().min(5,"Password must contain atleast 5 characters").max(20),
        fullName : z.string().min(3).max(30),
        username : z.string().min(3).max(30)
    })
    const parsedDatawithSuccess = requiredBody.safeParse(req.body);
    if(!parsedDatawithSuccess.success){
        res.status(400).json({
            message : "Incorrect format",
            error : parsedDatawithSuccess.error
        })
        return;
    }

    const existingUser = await User.findOne({username});
    if(existingUser){
        return res.status(400).json(
            {
                error : "username already taken!"
            }
        )
    }
    const existingEmail = await User.findOne({email});
    if(existingEmail){
        return res.status(400).json(
            {
                error : "Email already taken!"
            }
        )
    }
    const hashedPassword = await bcrypt.hash(password,10)

    const newUser = new User({
        fullName : fullName,
        username : username,
        email : email,
        password : hashedPassword
    })

    if(newUser){
        
        await newUser.save();
        generateTokenAndSetCookie(newUser._id,res)
        
        res.status(201).json({
            _id: newUser._id,
            fullName : newUser.fullName,
            username : newUser.username,
            email : newUser.email,
            followers : newUser.followers,
            following : newUser.following,
            profileImg : newUser.profileImg,
            coverImg : newUser.coverImg
        })
    }
    else{
        res.status(400).json({
            error : "Invalid User Data"
        })
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({
        error : "Internal Server Error"
    })
  }
};
const login = async (req, res) => {
    try{
        const { username, password}=req.body;
        const user = await User.findOne({username});
        if(!user){
            res.status(403).json({
                message : "No user found with this username."
            })
            return;
        }
        const passwordMatch = await bcrypt.compare(password, user.password) //Here used question mark so that if no password is available then, it will not crash, rather it will compare with an empty string.
        if(passwordMatch){
            generateTokenAndSetCookie(user._id, res);
            res.status(200).json({
            _id: user._id,
            fullName : user.fullName,
            username : user.username,
            email : user.email,
            followers : user.followers,
            following : user.following,
            profileImg : user.profileImg,
            coverImg : user.coverImg
            })
        }else{
            res.status(401).json({
                message : "Password does not match"
            })
        }

    } catch(error){
        console.log("Error in login controller", error.message);
        res.status(500).json({
            error : "Internal Server Error"
        })
    }
    
};
const logout = async (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0}),
        res.status(200).json({
            message:"User successfully signed out"
        })
    } catch (error) {
        console.log("Error in logout controller", error.message),
        res.status(500).json({
            error:"Internal Server Error"
        })
        
    }
    res.json({
        message: "You hit the logout endpoint"
    });
};


const getMe = async (req, res) => {
    try {
        const user  = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);

    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.json({
            error : "Error in authenticating from the protected route"
        })
    }
}

const sendOtp = async (req, res) => {
    const email = req.body.email;
  
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000);
  
    // Use environment variables for security
    const transporter = nodemailer.createTransport({
      //host: "smtp.titan.email",
    //   port: 587, // Try 587 instead of 465
    //   secure: false, // false for 587, true for 465
    service: "gmail",
      auth: {
        user: "",
        pass: "", // Store this in .env file
      },
    //   tls: {
    //     rejectUnauthorized: false // Add this if you're having SSL issues
    //   }
    });
  
    try {
      // Test SMTP connection first
      console.log("Testing SMTP connection...");
      await transporter.verify();
      console.log("SMTP connection successful");
  
      const info = await transporter.sendMail({
        from: '"Important Account" <important@yashhh.tech>',
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your OTP Code</h2>
            <p>Your OTP is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
  
      console.log("Message sent successfully:", info.messageId);
      
      // Don't send OTP in response in production
      res.status(200).json({ 
        message: "OTP sent successfully",
        messageId: info.messageId
        // otp: otp // Remove this line in production
      });
  
    } catch (error) {
      console.error("Detailed error sending OTP:", {
        message: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode
      });
      
      res.status(500).json({ 
        error: "Failed to send OTP",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

const verify = async (req,res)=>{
    const email = req.body.email;

}


export {signup, login, logout, getMe, verify, sendOtp};