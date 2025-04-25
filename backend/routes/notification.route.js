import express from "express";
import protectedRoute from "../middlewares/protectedRoute.js";
import { getNotifications, deleteNotifications, deleteNotification } from "../controllers/notification.controller.js";
const router = express.Router();


router.get("/",protectedRoute,getNotifications);
router.delete("/",protectedRoute, deleteNotifications);
router.delete("/:id",protectedRoute, deleteNotification);

export default router;