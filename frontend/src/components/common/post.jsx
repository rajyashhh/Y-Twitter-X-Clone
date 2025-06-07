import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {formatPostDate} from "../../utils/date/index.js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { IoClose } from "react-icons/io5";

// Utility function to render text with mentions and links
const renderTextWithMentions = (text) => {
	console.log("Input text for renderTextWithMentions:", text);
	const mentionRegex = /@([a-zA-Z0-9_]+)/g;
	// Refined regex to include URLs without http/https, like example.com or www.example.com
	const urlRegex = /\b((https?:\/\/|www\.)?\S+\.\S{2,}(?:\/\S*)*)\b/gi;

	const parts = [];
	let lastIndex = 0;
	let keyCounter = 0;

	const findNextMatch = () => {
		// Reset lastIndex for each regex before searching to ensure proper behavior
		mentionRegex.lastIndex = lastIndex;
		urlRegex.lastIndex = lastIndex;

		const nextMention = mentionRegex.exec(text);
		const nextUrl = urlRegex.exec(text);

		let nextMatch = null;

		if (nextMention && (!nextUrl || nextMention.index < nextUrl.index)) {
			nextMatch = {
				type: 'mention',
				value: nextMention[0],
				captured: nextMention[1],
				index: nextMention.index,
				length: nextMention[0].length,
			};
		} else if (nextUrl) {
			nextMatch = {
				type: 'url',
				value: nextUrl[0],
				captured: nextUrl[0],
				index: nextUrl.index,
				length: nextUrl[0].length,
			};
		}

		return nextMatch;
	};

	let currentMatch;
	while ((currentMatch = findNextMatch()) !== null) {
		console.log("Processing match:", currentMatch);
		// Add plain text before the current match
		if (currentMatch.index > lastIndex) {
			const plainText = text.substring(lastIndex, currentMatch.index);
			console.log("Adding plain text:", plainText);
			parts.push(<span key={`text-${keyCounter++}`} className="whitespace-pre-wrap">{plainText}</span>);
		}

		// Add the matched element
		if (currentMatch.type === 'mention') {
			console.log("Adding mention link:", currentMatch.value);
			parts.push(
				<Link key={`mention-${keyCounter++}`} to={`/profile/${currentMatch.captured}`} className="text-blue-500 hover:underline">
					{currentMatch.value}
				</Link>
			);
		} else if (currentMatch.type === 'url') {
			console.log("Adding URL link:", currentMatch.value);

			// Ensure the URL has a protocol for correct linking
			const href = currentMatch.value.startsWith('http') || currentMatch.value.startsWith('ftp')
				? currentMatch.value
				: `http://${currentMatch.value}`;

			parts.push(
				<a
					key={`url-${keyCounter++}`}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-500 hover:underline"
				>
					{currentMatch.value}
				</a>
			);
		}

		lastIndex = currentMatch.index + currentMatch.length;
		console.log("Updated lastIndex:", lastIndex);
	}

	// Add any remaining text after the last match
	if (lastIndex < text.length) {
		const remainingText = text.substring(lastIndex);
		console.log("Adding remaining text:", remainingText);
		parts.push(<span key={`text-${keyCounter++}`} className="whitespace-pre-wrap">{remainingText}</span>);
	}

	console.log("Final parts array:", parts);
	return parts;
};

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const [previewImg, setPreviewImg] = useState(null);
	const [mentionQuery, setMentionQuery] = useState("");
	const [mentionSuggestions, setMentionSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const textareaRef = useRef(null);

	const postOwner = post.user;
	
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

	const {mutate:deletePost, isPending:isDeleting} = useMutation({
		mutationFn: async()=>{
			try {
				const res = await fetch(`/api/posts/${post._id}`,{
					method: "DELETE",

				})
				const data = await res.json();

				if(!res.ok){
					throw new Error(data.error|| "Something went wrong")
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: ()=>{
			toast.success("Post Deleted Successfully!");
			queryClient.invalidateQueries({queryKey: ["posts"]})
		}
	})
	const isLiked = post.likes.includes(authUser._id);
	const  {mutate:likePost, isPending:isLiking} = useMutation({
		mutationFn: async()=>{
			try {
				const res = await fetch(`/api/posts/like/${post._id}`,{
					method: "POST",
				});
				const data = await res.json();
				if(!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw new Error(error)
			}
		},
		onSuccess:(updatedLikes)=>{
			//queryClient.invalidateQueries({queryKey: ["posts"]})
			// instead, update the cache for that post
			queryClient.setQueryData(["posts"], (oldData)=>{
				return oldData.map(p=>{
					if(p._id === post._id){
						return {...p, likes:updatedLikes}
					}
					return p;
				})
			})
		},
		onError:(error)=>{
			toast.error(error.message);
		}
	})
	const {mutate:commentPost, isPending:isCommenting} = useMutation({
		mutationFn: async()=>{
			try {
				const res = await fetch(`/api/posts/comment/${post._id}`,{
					method: "POST",
					headers : {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({text: comment})
				})
				const data = await res.json();
				if(!res.ok){
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (updatedComments)=>{
			//toast.success("Comment posted successfully!");
			setComment("");
			//queryClient.invalidateQueries({queryKey: ["posts"]});
			queryClient.setQueryData(["posts"], (oldData)=>{
				return oldData.map(p=>{
					if(p._id === post._id){
						return {...p, comments:updatedComments}
					}
					return p;
				})
			})
		},
		onError : (error)=>{
			toast.error(error.message)
		}
	})
	const isMyPost = authUser._id === post.user._id;

	const formattedDate = formatPostDate(post.createdAt);



	const handleDeletePost = () => {
		deletePost()
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return;

		// Ensure we don't show suggestions after posting
		setShowSuggestions(false);
		setMentionQuery("");
		setMentionSuggestions([]);

		commentPost();
	};

	const handleLikePost = () => {
		if(isLiking) return;
		likePost();
	};

	const handleCommentChange = (e) => {
		const value = e.target.value;
		setComment(value);

		const atIndex = value.lastIndexOf('@');
		if (atIndex > -1 && (value.charAt(atIndex - 1) === ' ' || atIndex === 0)) {
			const q = value.substring(atIndex + 1);
			setMentionQuery(q);
			// Show suggestions only if query is not empty after @
			setShowSuggestions(q.length > 0);
		} else {
			setMentionQuery("");
			setShowSuggestions(false);
		}
	};

	const handleSelectMention = (username) => {
		const currentComment = comment;
		const atIndex = currentComment.lastIndexOf('@');
		if (atIndex > -1) {
			const beforeAt = currentComment.substring(0, atIndex);
			const afterAt = currentComment.substring(atIndex);
			const newComment = beforeAt + `@${username} ` + afterAt.substring(mentionQuery.length + 1);
			setComment(newComment);
			setMentionQuery("");
			setMentionSuggestions([]);
			setShowSuggestions(false);
			// Optionally move cursor to the end of the inserted mention
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.focus();
					textareaRef.current.setSelectionRange(newComment.length, newComment.length);
				}
			}, 0);
		}
	};

	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && <FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />}
								{isDeleting && (
									<LoadingSpinner/>
								)}
							</span>
						)}
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{renderTextWithMentions(post.text)}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700 cursor-pointer'
								alt='Post Image'
								onClick={() => setPreviewImg(post.img)}
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.user.profileImg || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{renderTextWithMentions(comment.text)}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2 relative'
										onSubmit={handlePostComment}
									>
										<textarea
											ref={textareaRef}
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={handleCommentChange}
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
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? <LoadingSpinner size="md"/> : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size='sm'/>}
								{!isLiked && !isLiking && (
									<FaRegHeart  className='w-4 h-4 cursor-pointer text-slate-500  group-hover:text-pink-500  transition-transform duration-200' />
								)}
								{isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

								<span
									className={`text-sm  group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : "text-slate-500"
									}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
			{previewImg && (
				<div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
				<img
					src={previewImg}
					className="max-h-[90%] max-w-[90%] object-contain"
					alt="Full Preview"
				/>
				<button
					className="absolute top-4 right-4 text-white text-3xl"
					onClick={() => setPreviewImg(null)}
				>
					<IoClose />
				</button>
				</div>
			)}
		</>
	);
};
export default Post;