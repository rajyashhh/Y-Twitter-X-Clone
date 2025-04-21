
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
    res.json({
        message: "You hit the login endpoint"
    });
};
const logout = async (req, res) => {
    res.json({
        message: "You hit the logout endpoint"
    });
};

export {signup, login, logout};