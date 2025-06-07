import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient , useQuery} from "@tanstack/react-query";

import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [mentionQuery, setMentionQuery] = useState("");
	const [mentionSuggestions, setMentionSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const imgRef = useRef(null);
	const textareaRef = useRef(null);

	const {data:authUser} = useQuery({queryKey: ["authUser"]});
	
	const queryClient = useQueryClient();

	// Debounce the mention query
	useEffect(() => {
		const handler = setTimeout(() => {
			if (mentionQuery) {
				fetchMentions(mentionQuery);
			} else {
				setMentionSuggestions([]);
				setShowSuggestions(false);
			}
		}, 300);

		return () => {
			clearTimeout(handler);
		};
	}, [mentionQuery]);

	const fetchMentions = async (query) => {
		try {
			const res = await fetch(`/api/user/mentions/search?q=${query}`);
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to fetch mentions");
			}
			setMentionSuggestions(data);
			setShowSuggestions(data.length > 0);
		} catch (error) {
			console.error("Error fetching mentions:", error);
			setMentionSuggestions([]);
			setShowSuggestions(false);
		}
	};

	const {mutate:createPost, isPending, isError, error} = useMutation({
		mutationFn: async({text, img})=>{
			try {
				const res = await fetch("api/posts/create",{
					method: "POST",
					headers : {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({text,img}),
				})
				const data = await res.json();
				if(!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw new Error(error);
			}
		},

		onSuccess: ()=>{
			setText("");
			setImg(null);
			setMentionQuery("");
			setMentionSuggestions([]);
			setShowSuggestions(false);
			toast.success("Post created successfully"),
			queryClient.invalidateQueries({queryKey: ["posts"]});
		}
	})
	

	const handleSubmit = (e) => {
		e.preventDefault();
		createPost({text, img})
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleTextChange = (e) => {
		const value = e.target.value;
		setText(value);

		const atIndex = value.lastIndexOf('@');
		if (atIndex > -1 && (value.charAt(atIndex - 1) === ' ' || atIndex === 0)) {
			const q = value.substring(atIndex + 1);
			setMentionQuery(q);
			setShowSuggestions(q.length > 0); // Show suggestions only if query is not empty after @
		} else {
			setMentionQuery("");
			setShowSuggestions(false);
		}
	};

	const handleSelectMention = (username) => {
		const currentText = text;
		const atIndex = currentText.lastIndexOf('@');
		if (atIndex > -1) {
			const beforeAt = currentText.substring(0, atIndex);
			const afterAt = currentText.substring(atIndex);
			const newText = beforeAt + `@${username} ` + afterAt.substring(mentionQuery.length + 1);
			setText(newText);
			setMentionQuery("");
			setMentionSuggestions([]);
			setShowSuggestions(false);
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
					textareaRef.current.setSelectionRange(newText.length, newText.length);
				}
			}, 0);
		}
	};

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full relative' onSubmit={handleSubmit}>
				<textarea
					ref={textareaRef}
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
					placeholder='What is happening?!'
					value={text}
					onChange={handleTextChange}
				/>
				{showSuggestions && mentionSuggestions.length > 0 && (
					<div className="absolute bottom-full left-0 w-full bg-gray-800 border border-gray-700 rounded-md max-h-40 overflow-y-auto z-10">
						{mentionSuggestions.map((user) => (
							<div
								key={user._id}
								className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-700"
								onClick={() => handleSelectMention(user.username)}
							>
								<div className="avatar">
									<div className="w-6 rounded-full">
										<img src={user.profileImg || "/avatar-placeholder.png"} alt={user.username} />
									</div>
								</div>
								<span className="font-bold text-sm">@{user.username}</span>
							</div>
						))}
					</div>
				)}
				{img && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img src={img} className='w-full mx-auto h-72 object-contain rounded' />
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<input type='file'  accept="image/*" hidden ref={imgRef} onChange={handleImgChange} />
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};
export default CreatePost;