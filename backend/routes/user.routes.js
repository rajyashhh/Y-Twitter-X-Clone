import express from "express";
import protectedRoute from "../middlewares/protectedRoute";


const router = express.router();

router.get("/profile/:username",protectedRoute, getUserProfile);
router.get("/suggested",protectedRoute, getUserProfile);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateuserProfile)




export default router;