import express from 'express';
import {signup, login, logout, getMe} from '../controllers/auth.controller.js'

const router = express.Router();


router.post("/signup", signup);
router.get("/me", protectedRoute, getMe);
router.post("/login", login);
router.post("/logout", logout);
export default router;