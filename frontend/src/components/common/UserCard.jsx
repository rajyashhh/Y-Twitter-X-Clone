import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

const UserCard = ({ user }) => {
  const queryClient = useQueryClient();

  // Get current user's data to check following status
  const { data: currentUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { mutate: followUnfollow } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/user/follow/${user._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["suggestedUsers"]);
      queryClient.invalidateQueries(["followers", user.username]);
      queryClient.invalidateQueries(["following", user.username]);
      queryClient.invalidateQueries(["authUser"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isFollowing = currentUser?.following?.includes(user._id);

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-700">
      <div className="flex items-center gap-4">
        <Link to={`/profile/${user.username}`}>
          <img
            src={user.profileImg || "/avatar-placeholder.png"}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        </Link>
        <div>
          <Link to={`/profile/${user.username}`}>
            <p className="font-semibold hover:underline">{user.fullName}</p>
          </Link>
          <p className="text-gray-500 text-sm">@{user.username}</p>
        </div>
      </div>
      {currentUser?._id !== user._id && (
        <button
          onClick={() => followUnfollow()}
          className="bg-white text-black px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
};

export default UserCard; 