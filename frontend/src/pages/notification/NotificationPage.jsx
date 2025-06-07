import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query"
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { RiAtLine } from "react-icons/ri";
import toast from "react-hot-toast";

const NotificationPage = () => {
	const {data: notifications, isLoading, error} = useQuery({
		queryKey:["notifications"],
		queryFn: async()=>{
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				
				if (!res.ok) {
					throw new Error(data.error || "Failed to fetch notifications");
				}

				// Validate the data structure
				if (!Array.isArray(data)) {
					throw new Error("Invalid notifications data format");
				}

				return data;
			} catch (error) {
				console.error("Error fetching notifications:", error);
				throw new Error(error.message || "Failed to fetch notifications");
			}
		},
		retry: 1
	});

	const queryClient = useQueryClient();
	const {mutate: deleteNotifications } = useMutation({
		mutationFn: async()=>{
			try {
				const res = await fetch("/api/notifications",{
					method: "DELETE"
				});
				const data = await res.json();
				
				if (!res.ok) {
					throw new Error(data.error || "Failed to delete notifications");
				}
				
				return data;
			} catch (error) {
				console.error("Error deleting notifications:", error);
				throw new Error(error.message || "Failed to delete notifications");
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
		onSuccess: ()=>{
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({queryKey:["notifications"]});
		}
	});

	if (error) {
		console.error("Notification page error:", error);
		throw error;
	}

	if (isLoading) {
		return (
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-center h-full items-center'>
					<LoadingSpinner size='lg' />
				</div>
			</div>
		);
	}

	if (!notifications || !Array.isArray(notifications)) {
		return (
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='text-center p-4 font-bold'>No notifications available</div>
			</div>
		);
	}

	return (
		<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
			<div className='flex justify-between items-center p-4 border-b border-gray-700'>
				<p className='font-bold'>Notifications</p>
				<div className='dropdown'>
					<div tabIndex={0} role='button' className='m-1'>
						<IoSettingsOutline className='w-4' />
					</div>
					<ul
						tabIndex={0}
						className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
					>
						<li>
							<a onClick={() => deleteNotifications()}>Delete all notifications</a>
						</li>
					</ul>
				</div>
			</div>
			
			{notifications.length === 0 ? (
				<div className='text-center p-4 font-bold'>No notifications 🤔</div>
			) : (
				notifications.map((notification) => {
					if (!notification || !notification.from) {
						console.error("Invalid notification data:", notification);
						return null;
					}

					return (
						<div className='border-b border-gray-700' key={notification._id}>
							<div className='flex gap-2 p-4'>
								{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
								{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
								{notification.type === "mention" && <RiAtLine className='w-7 h-7 text-blue-500' />}
								<Link to={`/profile/${notification.from.username}`} className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img 
												src={notification.from.profileImg || "/avatar-placeholder.png"} 
												alt={`${notification.from.username}'s profile`}
											/>
										</div>
									</div>
									<div className='flex gap-1'>
										<span className='font-bold'>@{notification.from.username}</span>{" "}
										{notification.type === "follow" ? "followed you" : notification.type === "like" ? "liked your post" : "mentioned you"}
									</div>
								</Link>
							</div>
						</div>
					);
				})
			)}
		</div>
	);
};

export default NotificationPage;


