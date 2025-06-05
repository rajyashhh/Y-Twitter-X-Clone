import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import XSvg from "../../../components/svgs/X.jsx";
import { toast } from 'react-hot-toast';
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import {useMutation} from '@tanstack/react-query';


const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
		otp: "",
	});

	const [otpCoolDown, setOtpCoolDown] = useState(0);
	const [showOtpField, setShowOtpField] = useState(false);



	const {mutate, isError, isPending, error} = useMutation({
		mutationFn: async ({email,username,fullName,password}) => { 
			try {
				const res = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
		
					},
					body : JSON.stringify({email, username, fullName, password}),
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
			toast.success("Account created successfully!")
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault(); // page won't reload
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSendOtp = ()=>{
		if (!formData.email) {
			toast.error("Please enter your email first.");
			return; 
		}
		setShowOtpField(true);
		setOtpCoolDown(30);
		toast.success("OTP sent to your email id.")
	}

	const handleVerifyOtp = ()=>{
		toast.promise(
			saveSettings(settings),
			 {
			   loading: 'Verifying OTP',
			   success: <b>Account Verified</b>,
			   error: <b>Wrong OTP! Try again</b>,
			 }
		   );

		useEffect(()=>{
			let timer;
			if (otpCoolDown>0){
				timer = setInterval(()=>{setOtpCoolDown((prev)=>prev-1)},1000)
			}
			return ()=> clearInterval(timer);
		}, [otpCoolDown])
	}

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
							onChange={handleInputChange}
							value={formData.email}
							/>
						</label>
						
						<button
							type="button"
							onClick={handleSendOtp} 
							className='btn rounded-full btn-primary text-white btn-outline whitespace-nowrap'
							>
							Send OTP
						</button>
					</div>
					{showOtpField && (
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
					<button className='btn rounded-full btn-primary text-white'>
						{isPending ? "Loading...": "Sign Up"}
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
export default SignUpPage;