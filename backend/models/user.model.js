import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true
    },
    fullName : {
        type: String,
        required: true,
    },
    password : {
        type: String,
        required: true,
        minLength: 6
    }, 
    email : {
        type: String,
        required : true,
        unique : true
    },
    followers : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    profileImg:{
        type:String,
        default : ""
    },
    coverImg:{
        type:String,
        default : ""
    },
    bio : {
        type:String,
        default : ""
    },
    link:{
        type : String,
        default : ""
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    likedPosts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }],
    sessionVersion: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema);
export default User;