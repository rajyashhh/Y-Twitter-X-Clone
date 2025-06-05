import express from "express";
import protectedRoute from "../middlewares/protectedRoute.js";
import { getUserProfile, followUnfollowUser, getSuggestedUser, updateUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUser);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateUser);




export default router;