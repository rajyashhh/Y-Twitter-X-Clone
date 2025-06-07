import express from 'express';
import {signup, login, logout, getMe, verify, sendOtp, changePassword, sendOtpPass} from '../controllers/auth.controller.js'
import protectedRoute from '../middlewares/protectedRoute.js'
const router = express.Router();


router.post("/signup", signup);
router.get("/me", protectedRoute, getMe);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verify);
router.post("/send-otp", sendOtp);
router.post("/send-otp-pass", sendOtpPass);
router.post("/forgot-password", changePassword );
export default router;