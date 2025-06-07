import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import XSvg from "../../../components/svgs/X.jsx";
import { toast } from 'react-hot-toast';
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import {useMutation, useQueryClient} from '@tanstack/react-query';


const ForgotPasswordPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		otp: "",
	});
	const [otpCoolDown, setOtpCoolDown] = useState(0);
	const [showOtpField, setShowOtpField] = useState(false);
	const [isOtpVerified, setIsOtpVerified] = useState(false);
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	
	// Security: Add verification token state
	const [verificationToken, setVerificationToken] = useState(null);
	const [verificationTimestamp, setVerificationTimestamp] = useState(null);
	
	const navigate = useNavigate();
	useEffect(() => {
		const handleContextMenu = (e) => {
			e.preventDefault();
			toast.error("Right-click is disabled for security reasons.");
			return false;
		};

		const handleKeyDown = (e) => {
			// Disable F12 (Developer Tools)
			if (e.key === 'F12') {
				e.preventDefault();
				toast.error("Developer tools are disabled for security reasons.");
				return false;
			}
			
			// Disable Ctrl+Shift+I (Developer Tools)
			if (e.ctrlKey && e.shiftKey && e.key === 'I') {
				e.preventDefault();
				toast.error("Developer tools are disabled for security reasons.");
				return false;
			}
			
			// Disable Ctrl+Shift+J (Console)
			if (e.ctrlKey && e.shiftKey && e.key === 'J') {
				e.preventDefault();
				toast.error("Console access is disabled for security reasons.");
				return false;
			}
			
			// Disable Ctrl+U (View Source)
			if (e.ctrlKey && e.key === 'u') {
				e.preventDefault();
				toast.error("View source is disabled for security reasons.");
				return false;
			}
			
			// Disable Ctrl+Shift+C (Element Inspector)
			if (e.ctrlKey && e.shiftKey && e.key === 'C') {
				e.preventDefault();
				toast.error("Element inspector is disabled for security reasons.");
				return false;
			}
			
			// Disable Ctrl+A (Select All) - optional
			if (e.ctrlKey && e.key === 'a') {
				e.preventDefault();
				return false;
			}
		};

		const handleSelectStart = (e) => {
			e.preventDefault();
			return false;
		};

		const handleDragStart = (e) => {
			e.preventDefault();
			return false;
		};

		// Add event listeners
		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('selectstart', handleSelectStart);
		document.addEventListener('dragstart', handleDragStart);

		// Disable text selection via CSS
		document.body.style.userSelect = 'none';
		document.body.style.webkitUserSelect = 'none';
		document.body.style.mozUserSelect = 'none';
		document.body.style.msUserSelect = 'none';

		// Cleanup function
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('selectstart', handleSelectStart);
			document.removeEventListener('dragstart', handleDragStart);
			
			// Restore text selection
			document.body.style.userSelect = 'auto';
			document.body.style.webkitUserSelect = 'auto';
			document.body.style.mozUserSelect = 'auto';
			document.body.style.msUserSelect = 'auto';
		};
	}, []);
	useEffect(() => {
		let interval;
	
		if (otpCoolDown > 0) {
			interval = setInterval(() => {
				setOtpCoolDown(prev => {
					if (prev <= 1) {
						clearInterval(interval);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
	
		return () => clearInterval(interval);
	}, [otpCoolDown]);
	
	// Security: Check if verification is still valid (within 10 minutes)
	const isVerificationValid = () => {
		if (!verificationTimestamp || !isOtpVerified) return false;
		const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
		return verificationTimestamp > tenMinutesAgo;
	};

	// Security: Reset verification if expired
	useEffect(() => {
		const checkVerificationExpiry = () => {
			if (isOtpVerified && !isVerificationValid()) {
				setIsOtpVerified(false);
				setIsEmailVerified(false);
				setVerificationToken(null);
				setVerificationTimestamp(null);
				toast.error("Verification expired. Please verify your email again.");
			}
		};

		const interval = setInterval(checkVerificationExpiry, 30000); // Check every 30 seconds
		return () => clearInterval(interval);
	}, [isOtpVerified, verificationTimestamp]);

	const queryClient = useQueryClient();
	const {mutate, isError, isPending, error} = useMutation({
		mutationFn: async ({email, password}) => { 
			// Security: Validate verification before making request
			if (!isOtpVerified || !verificationToken || !isVerificationValid()) {
				throw new Error("Email verification required. Please verify your email with OTP first.");
			}

			try {
				const res = await fetch("/api/auth/forgot-password", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						// Security: Include verification token in headers
						"X-Verification-Token": verificationToken,
					},
					body : JSON.stringify({email, password}),
				} );
				
				const data = await res.json();

				if (!res.ok) {
					let message = "Something went wrong";

					if (data.error && typeof data.error === "string") {
						message = data.error;
					} else if (data.error && typeof data.error === "object") {
						message = data.error?.issues?.[0]?.message || JSON.stringify(data.error);
					} else if (data.message) {
						message = data.message;
					}

					throw new Error(message);
				}
				console.log(data);
				return data;

			} catch (error) {
				console.log(error);
				throw error;
			}
		},
		onSuccess: ()=> {
			queryClient.invalidateQueries({ queryKey: ["authUser"] }); 
			toast.success("Password Changed Successfully!");
			// Security: Clear verification data after successful password change
			setIsOtpVerified(false);
			setIsEmailVerified(false);
			setVerificationToken(null);
			setVerificationTimestamp(null);
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		
		// Security: Additional frontend validation
		if (!isOtpVerified || !verificationToken || !isVerificationValid()) {
			toast.error("Please verify your email with OTP first.");
			return;
		}

		if (!formData.email || !formData.password) {
			toast.error("Please fill in all required fields.");
			return;
		}

		if (formData.password.length < 5) {
			toast.error("Password must be at least 5 characters long.");
			return;
		}
        
        mutate({ email: formData.email, password: formData.password });
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		
		// Security: Reset verification if email is changed after verification
		if (name === "email" && isEmailVerified && value !== formData.email) {
			setIsOtpVerified(false);
			setIsEmailVerified(false);
			setVerificationToken(null);
			setVerificationTimestamp(null);
			setShowOtpField(false);
			setIsOtpSent(false);
			toast.info("Email changed. Please verify your new email.");
		}
	};

	const handleSendOtp = async ()=>{
		if (otpCoolDown > 0) return;
		if (!formData.email) {
			toast.error("Please enter your email first.");
			return;
		}
		
		// Security: Reset previous verification when sending new OTP
		setIsOtpVerified(false);
		setIsEmailVerified(false);
		setVerificationToken(null);
		setVerificationTimestamp(null);
		
		setIsSendingOtp(true);
		try {
			const res = await fetch("/api/auth/send-otp-pass", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formData.email }),
			});
	
			const data = await res.json();
	
			if (!res.ok) {
				throw new Error(data.error || "No user exists with this email!");
			}
			setIsOtpSent(true);
			setShowOtpField(true);
			setOtpCoolDown(30);
			toast.success("OTP sent to your email.");
		} catch (err) {
			console.error("OTP error:", err);
			toast.error(err.message || "Something went wrong.");
		}finally {
			setIsSendingOtp(false); 
		}
	}

	const handleVerifyOtp = async () => {
		if (!formData.email || !formData.otp) {
			toast.error("Please enter both email and OTP.");
			return;
		}
	
		toast.promise(
			fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: formData.email, otp: formData.otp }),
			}).then(async (res) => {
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "OTP verification failed");
				}
				
				// Security: Store verification token and timestamp
				setIsOtpVerified(true);
				setIsEmailVerified(true);
				setVerificationToken(data.verificationToken);
				setVerificationTimestamp(Date.now());
				
				return data;
			}),
			{
				loading: "Verifying OTP...",
				success: "OTP Verified Successfully ✅",
				error: "Wrong OTP! Try again ❌",
			}
		);
	};
	
	// Security: Determine if change password button should be enabled
	const canChangePassword = isOtpVerified && verificationToken && isVerificationValid() && formData.email && formData.password;

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className=' lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-3xl font-extrabold text-white'>Forgot password?</h1>
					
					<div className="flex items-center gap-4">
						<label className='input input-bordered rounded flex items-center gap-2 w-full'>
							<MdOutlineMail />
							<input
							type='email'
							className='grow'
							placeholder='Email'
							name='email'
							disabled={isEmailVerified} 
        					readOnly={isEmailVerified} 
							onChange={handleInputChange}
							value={formData.email}
							/>
						</label>
						{!isOtpVerified && (
							<button
							type="button"
							onClick={handleSendOtp} 
							className={`btn rounded-full btn-primary text-white btn-outline whitespace-nowrap ${
								otpCoolDown > 0 ? "opacity-50 cursor-not-allowed" : ""
							}`}
							disabled={otpCoolDown > 0 || isSendingOtp}
							>
							{isSendingOtp
								? "Sending OTP..."
								: otpCoolDown > 0
								? `Resend in ${otpCoolDown}s`
								: isOtpSent
								? "Resend OTP"
								: "Send OTP"}
						</button>
						)}
						
					</div>
					{showOtpField && (
						<div className="flex items-center gap-4">
						<label className='input input-bordered rounded flex items-center gap-2 w-full mt-4'>
							<MdPassword />
							<input
							type='text'
							className='grow'
							placeholder='Enter OTP'
							name='otp'
							disabled={isOtpVerified}
							onChange={handleInputChange}
							value={formData.otp}
							/>
						</label>
						<button
							type="button"
							onClick={handleVerifyOtp}
							disabled={isOtpVerified || !formData.otp}
							className={`btn rounded-full btn-primary text-white ${isOtpVerified ? "cursor-default opacity-80" : ""}`}
						>
							{isOtpVerified ? "Verified ✅" : "Verify OTP"}
						</button>
						</div>
					)}
					
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='New Password'
							name='password'
							disabled={!isOtpVerified}
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					
					{/* Security: Enhanced button with multiple validation layers */}
					<button 
						type="submit"
						className={`btn rounded-full btn-primary text-white ${
							!canChangePassword ? "opacity-50 cursor-not-allowed" : ""
						}`}
						disabled={!canChangePassword || isPending}
						onClick={(e) => {
							// Security: Additional click handler validation
							if (!canChangePassword) {
								e.preventDefault();
								toast.error("Please complete email verification first.");
								return;
							}
						}}
					>
						{isPending ? "Loading...": "Change password"}
					</button>
					
					{/* Security: Show verification status */}
					{isOtpVerified && isVerificationValid() && (
						<p className='text-green-500 text-sm text-center'>
							✅ Email verified - You can now change your password
						</p>
					)}
					
					{isOtpVerified && !isVerificationValid() && (
						<p className='text-red-500 text-sm text-center'>
							⚠️ Verification expired - Please verify your email again
						</p>
					)}
					
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Now, Sign In!</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default ForgotPasswordPage;