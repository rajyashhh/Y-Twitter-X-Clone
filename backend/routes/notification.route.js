import express from "express";
import protectedRoute from "../middlewares/protectedRoute.js";
import { getNotifications, deleteNotifications } from "../controllers/notification.controller.js";
const router = express.Router();


router.get("/",protectedRoute,getNotifications);
router.delete("/",protectedRoute, deleteNotifications);

export default router;