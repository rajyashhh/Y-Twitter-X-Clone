
import z from "zod";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import User from '../models/user.model.js';
import nodemailer from "nodemailer";
import dotenv from "dotenv"
import Otp from "../models/otp.model.js";

dotenv.config();
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
    try {
      const email = req.body.email?.trim();
  
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }
  
      // More robust email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }
  
      // Check rate limiting (optional - implement based on your needs)
      // const recentOtp = await Otp.findOne({ 
      //   email, 
      //   createdAt: { $gte: new Date(Date.now() - 60000) } // 1 minute cooldown
      // });
      // if (recentOtp) {
      //   return res.status(429).json({ error: "Please wait before requesting another OTP." });
      // }
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
  
      await Otp.deleteMany({ email });
      await Otp.create({
        email,
        code: hashedOtp,
        expiresAt: expiry
      });
  
      // Use environment variables for email configuration
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Set in .env file
          pass: process.env.EMAIL_PASS  // Set in .env file
        }
      });
  
      await transporter.verify();
  
      const info = await transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'Yashh Tech Team'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 400px; margin: auto; background-color: #f9f9f9; padding: 24px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #333;">🔐 OTP Verification</h2>
            <p style="font-size: 16px;">Use the following code to complete your verification:</p>
            <p style="font-size: 28px; font-weight: bold; color: #007bff;">${otp}</p>
            <p style="font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="font-size: 12px; color: #888;">If you didn't request this, you can ignore this email.</p>
          </div>`
      });
  
      console.log("OTP sent successfully");
  
      return res.status(200).json({
        message: "OTP sent successfully"
        // Don't return messageId for security
      });
  
    } catch (error) {
      console.error("Error sending OTP:", error);
      
      // Don't expose internal error details
      return res.status(500).json({ 
        error: "Failed to send OTP. Please try again." 
      });
    }
  };

const verify = async (req,res)=>{  const { email, otp } = req.body;

if (!email || !otp) {
  return res.status(400).json({ error: "Email and OTP are required" });
}

try {
  // 1. Find the OTP record
  const otpRecord = await Otp.findOne({ email });

  if (!otpRecord) {
    return res.status(400).json({ error: "OTP not found or already used" });
  }

  // 2. Check if expired
  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteOne({ email }); // Clean up expired OTP
    return res.status(400).json({ error: "OTP has expired. Please request a new one." });
  }

  // 3. Compare hashed OTP
  const isMatch = await bcrypt.compare(otp, otpRecord.code);

  if (!isMatch) {
    return res.status(401).json({ error: "Incorrect OTP" });
  }

  // 4. Success – optional cleanup
  await Otp.deleteOne({ email });

  res.status(200).json({ message: "OTP verified successfully" });

  // You can now mark the email as verified or continue to signup
} catch (error) {
  console.error("Error verifying OTP:", error.message);
  res.status(500).json({ error: "Internal server error" });
}
};


export {signup, login, logout, getMe, verify, sendOtp};