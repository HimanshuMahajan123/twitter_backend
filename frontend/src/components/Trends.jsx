import { useEffect, useState } from "react";
import { trendsService } from "../services/TrendsService.js";
import Post from "./Post";
import { useAuth } from "../context/AuthContext";
import { followService } from "../services/followService";

const Trends = () => {
  const { user } = useAuth();
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [followingSet, setFollowingSet] = useState(new Set());

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const data = await trendsService.getTrends();
        setTrends(data.trendingPosts || []);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load trending posts right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user?.username) return;
      try {
        const res = await followService.getFollowing();
        const following = res.data?.following || [];
        console.log("following", following);
        const ids = following
          .map((f) => f?.followingId?._id)
          .filter(Boolean);
        setFollowingSet(new Set(ids));
      } catch (err) {
        // non-blocking for trends UI
        console.error("Failed to fetch following list", err);
      }
    };

    fetchFollowing();
  }, [user?._id]);

  const getPreview = (trend) => {
    const text = trend?.content?.text;
    if (text?.length) {
      return text.length > 120 ? `${text.slice(0, 120)}...` : text;
    }
    if (trend?.content?.imageUrl?.length) {
      return "Photo post";
    }
    if (trend?.content?.videoUrl) {
      return "Video post";
    }
    return "Post";
  };

  const handleSelect = (trend) => {
    setSelectedPost(trend);
  };

  const closeSelected = () => setSelectedPost(null);

  const renderPost = () => {
    if (!selectedPost) return null;

    const creatorId = selectedPost.creator?._id;
    const isFollowing = creatorId
      ? followingSet.has(creatorId)
      : false;

    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 backdrop-blur-sm px-4 py-10">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="text-sm text-gray-600">
              Viewing post by @{selectedPost.creator?.username}
            </div>
            <button
              onClick={closeSelected}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close post view"
            >
              ✕
            </button>
          </div>

          <Post
            post={{
              type: "POST",
              post: selectedPost,
              isFollowing,
              isRepostedByMe: false,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="sticky top-4 h-[calc(100vh-2rem)] bg-gray-100 rounded-xl p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Trending Posts</h2>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && trends.length === 0 && !error && (
        <div className="text-sm text-gray-500">No trending posts yet.</div>
      )}

      <ul className="space-y-3 overflow-y-auto flex-1 pr-1">
        {trends.map((trend) => (
          <li key={trend._id || trend.id}>
            <button
              type="button"
              onClick={() => handleSelect(trend)}
              className="w-full text-left group rounded-lg bg-white px-3 py-2 hover:bg-gray-50 transition"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    @{trend?.creator?.username || "unknown"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                    {getPreview(trend)}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  ❤️ {trend?.likesCount ?? 0}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {renderPost()}
    </div>
  );
};

export default Trends;