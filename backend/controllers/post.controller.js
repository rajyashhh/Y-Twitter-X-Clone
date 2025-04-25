import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import cloudinary from "cloudinary";
import Notification from "../models/notification.model.js";
const createPost = async (req,res)=>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message : "user not found"
            })
        }
        if(!text && !img){
            return res.status(400).json({
                error : "Post must have text or image"
            });
        }
        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img);
            img = uploadResponse.secure_url;
        }
        const newPost = new Post({
            user : userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({
            error : error.message
        })
        console.log("Error in post controller : ", error.message)
    }
}


const deletePost = async (req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({
                error: "Post not found"
            })
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({
                error : "You are not authorized to delete this post"
            })
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(ImgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message : "Post deleted successfully"
        });
    } catch (error) {
        console.log("Error in deletepost controller: ", error);
        res.status(500).json({
            error: "Internal Server Error"
        })
    }
}


const commentOnPost = async (req,res)=>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text){
            return res.status(400).json({error: "Post not found"})
        }
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                error : "POst not found"
            })
        }
        const comment = {user: userId, text};
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.log("Error in commentOnPost controller: ", error.message);
        res.status(500).json({
            error: "Internal Server error"
        })
    }
}


const likeUnlikePost = async (req,res)=>{
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                error : "Post not found"
            })
        }

        const userLikedPost = post.likes.includes(userId);
        
        if(userLikedPost){
            //Unlike the post
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            res.status(200).json({message: "Post unliked successfully"})
        }
        else{
            //like the post
            post.likes.push(userId);
            await post.save();
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save();
            res.status(200).json({message: "Post liked successfully"})
        }
        } catch (error) {
            console.log("Error in likeUnlinePost controller: ", error.message);
            res.status(500).json({
                error: "Internal server error!"
            })
    }
}


const getAllPosts = async (req,res)=>{
    try {
        const posts = await Post.find().sort({createdAt : -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select : "-password"
        });
        if(posts.length===0){
            return res.status(200).json([])
        }
        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getting all the posts : ", error.message);
        res.status(500).json({
            error: "Internal Server Error!"
        })
    }
}

const getLikedPosts = async(req,res)=>{
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json(
                {
                    error: "User not Found!"
                }
            )
        }

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        return res.status(200).json(likedPosts)
    } catch (error) {
        console.log("Error in getting the liked posts : ", error.message);
        res.status(500).json({
            error: "internal Server error"
        })
    }
}
export {createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts};