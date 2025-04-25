import Notification from "../models/notification.model.js";

const getNotifications = async(req,res)=>{
    try {
        const userId= req.user._id;
        const notifications = await Notification.find({to: userId}).populate({
            path: "from",
            select : "username profileImg"
        })

        await Notification.updateMany({to:userId}, {read:true});
        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in getNotifications: ", error.message);
        return res.status(500).json("Internal Server error")
    }
}
const deleteNotifications = async(req,res)=>{
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to:userId});
        res.status(200).json({
            message: "notifiaction deleted"
        })
    } catch (error) {
        console.log("Error in deleteNotification: ", error.message);
        return res.status(500).json("Internal Server error")
    }
}
export {getNotifications, deleteNotifications}