import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import UserCard from "../../components/common/UserCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { FaArrowLeft } from "react-icons/fa6";

const FollowersPage = () => {
  const { username } = useParams();

  const { data: followers, isLoading } = useQuery({
    queryKey: ["followers", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/user/followers/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
      <div className="flex flex-col">
        <div className="flex gap-10 px-4 py-2 items-center">
          <Link to={`/profile/${username}`}>
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <p className="font-bold text-lg">Followers</p>
            <span className="text-sm text-slate-500">{followers?.length || 0} followers</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {!followers && <p className="text-center text-gray-500">Loading followers...</p>}
          {followers?.length === 0 && (
            <p className="text-center text-gray-500">No followers yet</p>
          )}
          <div className="flex flex-col gap-2">
            {followers?.map((follower) => (
              <UserCard key={follower._id} user={follower} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowersPage; 