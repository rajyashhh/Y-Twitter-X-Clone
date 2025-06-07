import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useFollow from "../../hooks/userfollow";

const SearchPage = ({ authUser }) => {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();
  const { follow, isPending } = useFollow();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await fetch(`/api/user/search?q=${query}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      return data;
    },
    enabled: query.length > 0, // only fetch when query is not empty
  });

  const handleFollow = async (userId) => {
    try {
      await follow(userId);
      // Invalidate queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries(["searchUsers", query]),
        queryClient.invalidateQueries(["suggestedUsers"]),
        queryClient.invalidateQueries(["userProfile", authUser?.username])
      ]);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <div className="flex-[4_4_0] min-h-screen border-l border-r border-gray-700 p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users by username or name..."
        className="input input-bordered w-full mb-4"
      />

      {isLoading && <LoadingSpinner />}
      {isError && <div className="text-red-500">Error fetching users</div>}

      {users?.length === 0 && query && (
        <div className="text-gray-400">No users found for "{query}"</div>
      )}

      <ul className="space-y-4">
        {users?.map((user) => {
          const isFollowing = authUser?.following.includes(user._id);
          const isMe = user._id === authUser?._id;

          return (
            <li key={user._id} className="flex items-center justify-between hover:bg-gray-800 p-2 rounded">
              <Link to={`/profile/${user.username}`} className="flex items-center gap-3 flex-1">
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img src={user.profileImg || "/avatar-placeholder.png"} alt={`${user.username}'s profile`} />
                  </div>
                </div>
                <div>
                  <p className="font-bold">@{user.username}</p>
                  <p className="text-sm text-gray-400">{user.fullName}</p>
                </div>
              </Link>
              {!isMe && (
                <button
                  onClick={() => handleFollow(user._id)}
                  disabled={isPending}
                  className={`btn btn-sm rounded-full ${
                    isFollowing ? "btn-ghost" : "btn-primary"
                  }`}
                >
                  {isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : isFollowing ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SearchPage;