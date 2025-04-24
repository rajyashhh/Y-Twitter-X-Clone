import express from "express";
import protectedRoute from "../middlewares/protectedRoute.js";
import { createPost, deletePost, commentOnPost } from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create",protectedRoute,createPost);
// router.post("/like/:id", protectedRoute, likeUnlinePost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id",protectedRoute,deletePost);

export default router;