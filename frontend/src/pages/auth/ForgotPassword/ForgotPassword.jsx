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
	const navigate = useNavigate();
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
		mutationFn: async ({email,password}) => { 
			try {
				const res = await fetch("/api/auth/forgot-password", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
		
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
			toast.success("Password Changed Successfully!")
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault(); // page won't reload
		
        mutate({ email: formData.email, password: formData.password });
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

	const handleSendOtp = async ()=>{
		if (otpCoolDown > 0) return;
		if (!formData.email) {
			toast.error("Please enter your email first.");
			return;
		}
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
				setIsOtpVerified(true);
				setIsEmailVerified(true);
				return data;
			}),
			{
				loading: "Verifying OTP...",
				success: "OTP Verified Successfully ✅",
				error: "Wrong OTP! Try again ❌",
			}
		);
	};
	

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
							placeholder='New Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
						/>
					</label>
					<button className='btn rounded-full btn-primary text-white' disabled={!isOtpVerified}>
						{isPending ? "Loading...": "Change password"}
					</button>
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