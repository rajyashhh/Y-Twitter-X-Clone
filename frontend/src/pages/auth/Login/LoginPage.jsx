import { useState } from "react";
import { Link } from "react-router-dom";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import {useMutation} from '@tanstack/react-query'

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const {mutate, isError, isPending, error} = useMutation({
		mutationFn: async ({username,password}) => { 
			try {
				const res = await fetch("/api/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
		
					},
					//body : JSON.stringify({username, password}),
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
			toast.success("Login Successful!")
		}
	});
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};


	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center  justify-center items-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdOutlineMail />
						<input
							type='text'
							className='grow'
							placeholder='username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
						/>
					</label>

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
					<button className='btn rounded-full btn-primary text-white'>Login</button>
					{isError && <p className='text-red-500'>Something went wrong</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};
export default LoginPage;