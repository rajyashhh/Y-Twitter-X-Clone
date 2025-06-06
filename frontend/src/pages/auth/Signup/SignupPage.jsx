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

const SignupPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
		otp: "",
	});
	const [otpCoolDown, setOtpCoolDown] = useState(0);
	const [showOtpField, setShowOtpField] = useState(false);
	const [isOtpVerified, setIsOtpVerified] = useState(false);
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isEmailVerified, setIsEmailVerified] = useState(false);
	const [usernameError, setUsernameError] = useState("");
	const [verificationToken, setVerificationToken] = useState(""); // ADD THIS STATE
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

	const queryClient = useQueryClient();
	const {mutate, isError, isPending, error} = useMutation({
		mutationFn: async ({email, username, fullName, password, verificationToken}) => { // ADD verificationToken PARAMETER
			try {
				const res = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({email, username, fullName, password, verificationToken}), // INCLUDE verificationToken
				});
				
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] }); 
			toast.success("Account created successfully!")
			navigate("/");
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		
		// Check if OTP is verified before allowing signup
		if (!isOtpVerified) {
			toast.error("Please verify your email with OTP first.");
			return;
		}

		// Check if verification token exists
		if (!verificationToken) {
			toast.error("Email verification token missing. Please verify your email again.");
			return;
		}

		// Trim username and fullName before submitting
		const trimmedData = {
			...formData,
			username: formData.username.trim(),
			fullName: formData.fullName.trim(),
			verificationToken: verificationToken // INCLUDE THE TOKEN
		};

		// Prevent submit if username error is present
		if (usernameError) {
			return;
		}
		
		mutate(trimmedData);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		if (name === "username") {
			if (/\s/.test(value)) {
				setUsernameError("Username cannot contain spaces.");
			} else {
				setUsernameError("");
			}
		}
	};

	const handleSendOtp = async () => {
		if (otpCoolDown > 0) return;
		if (!formData.email) {
			toast.error("Please enter your email first.");
			return;
		}
		setIsSendingOtp(true);
		try {
			const res = await fetch("/api/auth/send-otp", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formData.email }),
			});
	
			const data = await res.json();
	
			if (!res.ok) {
				throw new Error(data.error || "Failed to send OTP");
			}
			setIsOtpSent(true);
			setShowOtpField(true);
			setOtpCoolDown(30);
			toast.success("OTP sent to your email.");
		} catch (err) {
			console.error("OTP error:", err);
			toast.error(err.message || "Something went wrong.");
		} finally {
			setIsSendingOtp(false); 
		}
	}

	const handleVerifyOtp = async () => {
		if (!formData.email || !formData.otp) {
			toast.error("Please enter both email and OTP.");
			return;
		}
	
		try {
			const res = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: formData.email, otp: formData.otp }),
			});

			const data = await res.json();
			
			if (!res.ok) {
				throw new Error(data.error || "OTP verification failed");
			}

			// STORE THE VERIFICATION TOKEN FROM RESPONSE
			setVerificationToken(data.verificationToken);
			setIsOtpVerified(true);
			setIsEmailVerified(true);
			toast.success("OTP Verified Successfully ✅");
			
		} catch (error) {
			console.error("OTP verification error:", error);
			toast.error(error.message || "Wrong OTP! Try again ❌");
		}
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen px-10'>
			<div className='flex-1 hidden lg:flex items-center  justify-center'>
				<XSvg className=' lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
					<div className='flex gap-4 flex-wrap'>
						<label className='input input-bordered rounded flex items-center gap-2 '>
							<FaUser />
							<input
								type='text'
								className='grow '
								placeholder='Username'
								name='username'
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						{usernameError && <p className='text-xs text-red-500 ml-2 mb-2'>{usernameError}</p>}
						<label className='input input-bordered rounded flex items-center gap-2'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
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
									onChange={handleInputChange}
									value={formData.otp}
								/>
							</label>
							<button
								type="button"
								onClick={handleVerifyOtp}
								disabled={isOtpVerified}
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
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white' disabled={!isOtpVerified}>
						{isPending ? "Loading..." : "Sign Up"}
					</button>
					{isError && <p className='text-red-500'>{error.message}</p>}
				</form>
				<div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
					<p className='text-white text-lg'>Already have an account?</p>
					<Link to='/login'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign in</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;