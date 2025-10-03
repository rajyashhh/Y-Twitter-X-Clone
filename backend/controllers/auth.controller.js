import z from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import User from '../models/user.model.js';
import { Resend } from 'resend';
import dotenv from "dotenv"
import Otp from "../models/otp.model.js";

dotenv.config();

// Initialize Resend (guard for missing key)
let resend;
if (!process.env.RESEND_API_KEY) {
  console.error("WARNING: RESEND_API_KEY is not set in environment!");
} else {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
  } catch (e) {
    console.error("Failed to initialize Resend client:", e && e.stack ? e.stack : e);
  }
}

// Create a Map to store verified emails (in-memory)
const verifiedEmails = new Map();

// Improved helper function to send emails with Resend
const sendEmailWithResend = async (to, subject, html, text = null) => {
  try {
    if (!resend) {
      throw new Error("Resend client not initialized. Check RESEND_API_KEY.");
    }

    const payload = {
      from: 'Yashhh Tech Team <contact@yashhh.tech>',
      to: [to],
      subject,
      html,
      // plain-text fallback helps deliverability and some mail clients
      text: text || (typeof html === "string" ? html.replace(/<[^>]*>/g, "").slice(0, 1000) : ""),
      reply_to: 'contact@yashhh.tech',
    };

    // Send and capture full response (don't destructure)
    const response = await resend.emails.send(payload);

    // Log the full response for debugging/delivery info
    console.log("Resend send response:", JSON.stringify(response, null, 2));

    // If provider returns an error-like object, surface it
    if (response && (response.error || response.errors)) {
      console.error("Resend returned an error payload:", response.error || response.errors);
      throw new Error("Resend reported an error when sending email");
    }

    return response;
  } catch (err) {
    // log stack if available
    console.error("Error sending email with Resend:", err && err.stack ? err.stack : err);
    throw err;
  }
};

const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, verificationToken } = req.body;
    
    // CRITICAL VALIDATION #1: Check if verification token is provided
    if (!verificationToken) {
        return res.status(400).json({ 
            error: "Email verification required. Please verify your email with OTP first." 
        });
    }
    
    // CRITICAL VALIDATION #2: Verify the JWT token
    let tokenData;
    try {
        tokenData = jwt.verify(verificationToken, process.env.JWT_SECRET);
    } catch (jwtError) {
        return res.status(400).json({ 
            error: "Invalid or expired verification token. Please verify your email again." 
        });
    }
    
    // CRITICAL VALIDATION #3: Check if email in token matches request email
    if (tokenData.email !== email) {
        return res.status(400).json({ 
            error: "Email verification mismatch. Please verify your email again." 
        });
    }
    
    // CRITICAL VALIDATION #4: Check server-side verification status
    const verificationData = verifiedEmails.get(email);
    if (!verificationData || !verificationData.verified) {
        return res.status(400).json({ 
            error: "Email not verified. Please complete email verification first." 
        });
    }
    
    // CRITICAL VALIDATION #5: Check if verification is recent (within 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (verificationData.timestamp < tenMinutesAgo) {
        // Clean up expired verification
        verifiedEmails.delete(email);
        return res.status(400).json({ 
            error: "Email verification expired. Please verify your email again." 
        });
    }
    
    // CRITICAL VALIDATION #6: Verify token matches stored token
    if (verificationData.token !== verificationToken) {
        return res.status(400).json({ 
            error: "Invalid verification token. Please verify your email again." 
        });
    }

    // Zod validation
    const requiredBody = z.object({
        email: z.string().min(5).max(100).email(),
        password: z.string().min(5, "Password must contain atleast 5 characters").max(20),
        fullName: z.string().min(3).max(30),
        username: z.string().min(3).max(30)
    });

    const parsedDatawithSuccess = requiredBody.safeParse(req.body);
    if (!parsedDatawithSuccess.success) {
        res.status(400).json({
            message: "Incorrect format",
            error: parsedDatawithSuccess.error
        });
        return;
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({
            error: "username already taken!"
        });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({
            error: "Email already taken!"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        fullName: fullName,
        username: username,
        email: email,
        password: hashedPassword,
        sessionVersion: 0
    });

    if (newUser) {
        await newUser.save();
        
        // CRITICAL: Clean up verification data after successful signup
        verifiedEmails.delete(email);
        
        generateTokenAndSetCookie(newUser._id, newUser.sessionVersion, res);

        // Send welcome email with Resend - Cool & Minimal Design
 // Send welcome email with Resend - Simple & Traditional Design (like your nodemailer version)
try {
    console.log(`Attempting to send welcome email to ${email}`);
    const welcomeHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Hey ${username}, Welcome to Y! 🎉</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #fefefe;
              color: #333;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: auto;
              background: #fff;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 0 10px rgba(0,0,0,0.05);
            }
            h1 {
              color: #4A90E2;
            }
            .features {
              margin-top: 20px;
              padding-left: 20px;
            }
            .features li {
              margin-bottom: 10px;
            }
            .cta {
              margin-top: 30px;
              text-align: center;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              margin: 10px;
              background-color: #4A90E2;
              color: white;
              text-decoration: none;
              border-radius: 8px;
            }
            .footer {
              margin-top: 40px;
              font-size: 14px;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Y! 👋</h1>
            <p>Hey ${username}!</p>
            <p>We're so excited to have you on board. You're now part of a growing community that's all about connection, creativity, and good vibes. ✨</p>
        
            <h3>Here's what you can do on Y:</h3>
            <ul class="features">
              <li>📸 Share updates with your followers</li>
              <li>💬 Like and comment friends in real time</li>
              <li>🔔 Get instant notifications and never miss an update</li>
              <li>🎨 Personalize your profile and showcase your vibe</li>
              <li>🌟 Be part of an engaging, positive community</li>
            </ul>
        
            <div class="cta">
              <p>Enjoying the vibes already? We'd LOVE to hear your feedback!</p>
              <a href="https://y.yashhh.tech/" class="btn">Tweet About Us on Y itself!🐦</a>
              <a href="https://github.com/rajyashhh/Y-Twitter-X-Clone" class="btn">Star Us on GitHub ⭐</a>
              <a href="https://www.linkedin.com/in/yashhhhh/" class="btn">Follow me on LinkedIn🎓</a>
            </div>
        
            <div class="footer">
              Made with 💖 by the Yashhh<br/>
              You're awesome. Keep shining ✨
            </div>
          </div>
        </body>
        </html>`;

    const sendResp = await sendEmailWithResend(email, "Welcome to Y! 🎉", welcomeHtml, `Hey ${username}, welcome to Y! Start your journey at https://y.yashhh.tech/`);
    console.log("Welcome email send result:", sendResp && (sendResp.id || JSON.stringify(sendResp)));
} catch (emailError) {
    console.log("Welcome email failed to send:", emailError && (emailError.stack || emailError));
    // Don't fail signup if welcome email fails
}


        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg
        });
    } else {
        res.status(400).json({
            error: "Invalid User Data"
        });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({
        error: "Internal Server Error"
    });
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
        const passwordMatch = await bcrypt.compare(password, user.password)
        if(passwordMatch){
            generateTokenAndSetCookie(user._id, user.sessionVersion, res);
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
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Increment session version to invalidate all existing tokens
        user.sessionVersion += 1;
        await user.save();

        // Clear the current session cookie
        res.cookie("jwt", "", { maxAge: 0 });
        
        res.status(200).json({
            message: "Successfully logged out from all devices"
        });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
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
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
  
      await Otp.deleteMany({ email });
      await Otp.create({
        email,
        code: hashedOtp,
        expiresAt: expiry
      });
  
      // Send OTP with Resend - Cool & Minimal Design
      await sendEmailWithResend(
        email,
        "Your Y Verification Code 🔐",
        `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your OTP Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; min-height: 100vh;">
            <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 24px;">🔐</span>
                    </div>
                    <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Verification Code</h1>
                    <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                        Enter this code to complete your verification:
                    </p>
                    <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border-radius: 12px; padding: 24px; margin: 32px 0;">
                        <div style="font-size: 36px; font-weight: 800; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${otp}
                        </div>
                    </div>
                    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin: 24px 0;">
                        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                            ⏰ Expires in 10 minutes
                        </p>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0; line-height: 1.4;">
                        If you didn't request this code, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>`,
        `Your verification code is ${otp}. Expires in 10 minutes.`
      );
  
      console.log("OTP sent successfully");
  
      return res.status(200).json({
        message: "OTP sent successfully"
      });
  
    } catch (error) {
      console.error("Error sending OTP:", error);
      
      return res.status(500).json({ 
        error: "Failed to send OTP. Please try again." 
      });
    }
};

const sendOtpPass = async (req,res) => {
    try {
        const email = req.body.email?.trim();
        const user = await User.findOne({email});
        if(!user){
            res.status(403).json({
                message : "No user found with this email."
            })
            return;
        }
        if (!email) {
          return res.status(400).json({ error: "Email is required." });
        }
    
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format." });
        }
    
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const expiry = new Date(Date.now() + 10 * 60 * 1000);
    
        await Otp.deleteMany({ email });
        await Otp.create({
          email,
          code: hashedOtp,
          expiresAt: expiry
        });
    
        // Send Password Reset OTP with Resend - Cool & Minimal Design
        await sendEmailWithResend(
          email,
          "Reset Your Y Password 🔑",
          `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset OTP</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; min-height: 100vh;">
              <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
                  <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center;">
                      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444, #f97316); border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-size: 24px;">🔑</span>
                      </div>
                      <h1 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Password Reset</h1>
                      <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                          Use this code to reset your Y password:
                      </p>
                      <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 1px solid #fca5a5; border-radius: 12px; padding: 24px; margin: 32px 0;">
                          <div style="font-size: 36px; font-weight: 800; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                              ${otp}
                          </div>
                      </div>
                      <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin: 24px 0;">
                          <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                              ⏰ Expires in 10 minutes
                          </p>
                      </div>
                      <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 24px 0;">
                          <p style="color: #dc2626; font-size: 13px; margin: 0; font-weight: 500;">
                              ⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>`,
          `Your password reset code is ${otp}. Expires in 10 minutes.`
        );
    
        console.log("Password reset OTP sent successfully");
    
        return res.status(200).json({
          message: "OTP sent successfully"
        });
    
      } catch (error) {
        console.error("Error sending password reset OTP:", error);
        
        return res.status(500).json({ 
          error: "Failed to send OTP. Please try again." 
        });
      }
}

// FIXED VERIFY FUNCTION
const verify = async (req, res) => {
    const { email, otp } = req.body;

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

        // 3. Compare hashed OTP - MAKE SURE OTP IS STRING
        const isMatch = await bcrypt.compare(otp.toString(), otpRecord.code);

        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect OTP" });
        }

        // 4. Generate verification token after successful OTP verification
        const verificationToken = jwt.sign(
            { 
                email, 
                verified: true, 
                timestamp: Date.now() 
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );
        
        // Store verification status
        verifiedEmails.set(email, {
            verified: true,
            token: verificationToken,
            timestamp: Date.now()
        });

        // 5. Clean up OTP after successful verification
        await Otp.deleteOne({ email });

        res.status(200).json({ 
            message: "OTP verified successfully",
            verificationToken
        });

    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and new password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ error: "Failed to change password. Please try again." });
    }
};

const logoutAllDevices = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.sessionVersion += 1;
        await user.save();

        res.cookie("jwt", "", { maxAge: 0 });

        res.status(200).json({
            message: "Successfully logged out from all devices"
        });
    } catch (error) {
        console.log("Error in logoutAllDevices controller", error.message);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export {
    signup,
    login,
    logout,
    getMe,
    sendOtp,
    sendOtpPass,
    verify,
    changePassword,
    logoutAllDevices
};