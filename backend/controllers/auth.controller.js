
import z from "zod";
import bcrypt from "bcrypt";

import User from '../models/user.model.js'

const signup = async (req, res) => {
  try {
    const {fullName, userName, email, password}=req.body;
    const requiredBody = z.object({
        email : z.string().min(5).max(100).email(),
        password : z.string().min(5,"Password must contain atleast 5 characters").max(20),
        fullName : z.string().min(3).max(30),
        userName : z.string().min(3).max(30)
    })
    const parsedDatawithSuccess = requiredBody.safeParse(req.body);
    if(!parsedDatawithSuccess.success){
        res.status(400).json({
            message : "Incorrect format",
            error : parsedDatawithSuccess.error
        })
        return;
    }

    const existingUser = await User.findOne({userName});
    if(existingUser){
        return res.status(400).json(
            {
                error : "Username already taken!"
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
        userName : userName,
        email : email,
        password : hashedPassword
    })

    if(newUser){
        generateTokenAndSetCookie(newUser._id,res)
        await newUser.save();
        res.status(201).json({
            _id: newUser._id,
            fullName : newUser.fullName,
            userName : newUser.userName,
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
    console.log("Error in signup controller");
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