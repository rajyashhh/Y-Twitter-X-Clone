
import z from "zod";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie.js";
import User from '../models/user.model.js'

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
        generateTokenAndSetCookie(newUser._id,res)
        await newUser.save();
        
        
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
        const { email, password}=req.body;
        const user = await User.findOne({email});
        if(!user){
            res.json({
                message : "No user found with this email ID"
            })
            return;
        }
        const passwordMatch = bcrypt.compare(password, user?.password || "") //Here used question mark so that if no password is available then, it will not crash, rather it will compare with an empty string.
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
            res.json({
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
    res.json({
        message: "You hit the logout endpoint"
    });
};

export {signup, login, logout};