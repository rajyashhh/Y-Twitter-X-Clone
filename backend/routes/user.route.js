import express from "express";
import protectedRoute from "../middlewares/protectedRoute.js";
import { getUserProfile, followUnfollowUser, getSuggestedUser, updateUser, getFollowers, getFollowing, searchUsers, searchMentions } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUser);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateUser);
router.get("/followers/:username", protectedRoute, getFollowers);
router.get("/following/:username", protectedRoute, getFollowing);
router.get("/search", protectedRoute, searchUsers);
router.get("/mentions/search", protectedRoute, searchMentions);

export default router;