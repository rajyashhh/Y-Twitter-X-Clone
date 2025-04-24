import { resolveSoa } from "dns";
import Notification from "../models/notification.moodel.js";
import User from "../models/user.model.js"




const getUserProfile = async (req,res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({
                error : "No user found with this username"
            })
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile: ", error.message),
        res.status(500).json({
            error : error.message
        })
    }
}


const followUnfollowUser = async (req,res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id===req.user._id.toString()){
            return res.status(400).json({
                message : "You can not follow/unfollow yourself!"
            })
        }
        if(!userToModify || !currentUser){
            return res.status(400).json({
                error : "User not found!"
            })
        }


        const isFollowing = currentUser.following.includes(id);
        if(isFollowing){
            //Unfollow the user
            await User.findByIdAndUpdate(id,{
                $pull: {followers : req.user._id}
            });
            await User.findByIdAndUpdate(req.user._id, {
                $pull: {following: id}
            });
            res.status(200).json({
                message: "User unfollowed successfully"
            })
        }else{
            //Follow the user
            await User.findByIdAndUpdate(id,{ $push: {followers : req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
            
            //Send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
             await newNotification.save();
             res.status(200).json({
                message: "User followed successfully"
            })
        }
    } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message),
        res.status(500).json({
            error : error.message
        })
    }
}


const getSuggestedUser = async(req,res) => {
    try {
        const userId= req.user._id;
        const userFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([{
            $match: {
                _id: {$ne: userId},
            },
        },
        {
            $sample: {size:10}
        }
    ]);
    const filteredUsers = users.filter((user)=>!userFollowedByMe.following.includes(user._id));
    const suggestedUsers = filteredUsers.slice(0,4);
    suggestedUsers.forEach((user)=> (user.password = null));
    res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({error: error.messsage})
    }
}
export {getUserProfile, followUnfollowUser, getSuggestedUser};