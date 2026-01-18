import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { likeService } from "../services/likeService";
import { followService } from "../services/followService";

const Post = ({ post }) => {
  const { user } = useAuth();

  /* ---------------- FEED NORMALIZATION ---------------- */

  const isRepost = post.type === "REPOST";
 
  // actual post data
  const actualPost = isRepost ? post.post : post;
  
  // creator of original post
  console.log("Actual post:", actualPost);
  const creator = actualPost?.post.creator || {};
  console.log("Post creator:", creator);
  // reposted by user (if repost)
  const repostedBy = isRepost ? post.repostedBy : null;

  const content = actualPost?.post.content || {};

  const isOwnPost = user?._id === creator?._id;

  /* ---------------- LIKE STATE ---------------- */

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(actualPost?.likesCount || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actualPost?._id) {
      checkLikeStatus();
    }
    // eslint-disable-next-line
  }, [actualPost?._id]);

  const checkLikeStatus = async () => {
    try {
      const res = await likeService.isPostLiked(actualPost._id);
      setIsLiked(Boolean(res.data?.isLiked));
    } catch (err) {
      console.error("Like status error:", err);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const handleLike = async () => {
    try {
      setLoading(true);
      if (isLiked) {
        await likeService.removeLike(actualPost._id);
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        await likeService.addLike(actualPost._id);
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setLoading(true);
      if (isFollowing) {
        await followService.removeFollow(creator._id);
        setIsFollowing(false);
      } else {
        await followService.addFollow(creator._id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50">

      {/* REPOST INFO */}
      {isRepost && repostedBy && (
        <div className="text-xs text-gray-500 mb-1">
          🔁 Reposted by @{repostedBy.username}
        </div>
      )}

      <div className="flex space-x-3">
        <img
          src={creator.avatar || "https://via.placeholder.com/48"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover bg-gray-200"
          onError={(e) => (e.target.src = "https://via.placeholder.com/48")}
        />

        <div className="flex-1">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                @{creator.username || "unknown"}
              </span>
              <span className="text-gray-500 text-sm">
                · {formatDate(actualPost.createdAt)}
              </span>
            </div>

            {!isOwnPost && creator._id && (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={`px-4 py-1 rounded-full text-sm font-semibold
                  ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700"
                      : "bg-[#1DA1F2] text-white"
                  }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* TEXT */}
          {content.text && (
            <p className="mt-2 whitespace-pre-wrap text-gray-900">
              {content.text}
            </p>
          )}

          {/* LINK */}
          {content.linkUrl && (
            <a
              href={content.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-[#1DA1F2] hover:underline"
            >
              {content.linkUrl}
            </a>
          )}

          {/* IMAGES */}
          {content.imageUrl?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {content.imageUrl.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="post"
                  className="rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* VIDEO */}
          {content.videoUrl && (
            <video
              src={content.videoUrl}
              controls
              className="w-full rounded-lg mt-3"
            />
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-6 mt-3 text-gray-500">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center gap-2 ${
                isLiked ? "text-red-500" : "hover:text-[#1DA1F2]"
              }`}
            >
              <span>{isLiked ? "❤️" : "🤍"}</span>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
