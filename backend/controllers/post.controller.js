import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import cloudinary from "cloudinary";
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

export {createPost, deletePost};