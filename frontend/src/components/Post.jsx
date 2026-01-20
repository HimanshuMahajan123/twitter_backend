import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { likeService } from "../services/likeService";
import { repostService } from "../services/repostService";
import { followService } from "../services/followService";

const Post = ({ post }) => {
  const { user } = useAuth();

  /* ---------------- NORMALIZATION ---------------- */

  const isRepost = post.type === "REPOST";
  const actualPost = post.post;
  const creator = actualPost?.creator;
  const repostedBy = isRepost ? post.repostedBy : null;
  const content = actualPost?.content || {};

  const isOwnPost = user?._id === creator?._id;

  /* ---------------- STATE ---------------- */

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(actualPost?.likesCount || 0);
  const [isFollowing, setIsFollowing] = useState(post.isFollowing === true);
  const [isRepostedByMe, setIsRepostedByMe] = useState(
    post.isRepostedByMe === true
  );
  const [loading, setLoading] = useState(false);
  const [isMe , setIsMe] = useState(false);

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (!actualPost?._id) return;
    setIsRepostedByMe(post.isRepostedByMe === true);
    setIsFollowing(post.isFollowing === true);
    checkLikeStatus();
    setIsMe(user?.username === creator?.username);
  }, [actualPost?._id, post.isFollowing, post.isRepostedByMe]);

  /* ---------------- LIKE ---------------- */

  const checkLikeStatus = async () => {
    try {
      const res = await likeService.isPostLiked(actualPost._id);
      setIsLiked(Boolean(res.data?.isLiked));
    } catch (err) {
      console.error("Like check failed", err);
    }
  };

  const toggleLike = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await likeService.toggleLike(actualPost._id);
      setIsLiked(prev => !prev);
      setLikesCount(c => (isLiked ? c - 1 : c + 1));
    } catch (err) {
      console.error("Like failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FOLLOW ---------------- */

  const toggleFollow = async () => {
    if (loading || isOwnPost) return;
    setLoading(true);

    try {
      await followService.toggleFollow(creator._id);
      setIsFollowing(prev => !prev); // optimistic
    } catch (err) {
      console.error("Follow failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- REPOST ---------------- */

  const handleRepost = async () => {
    if (loading || isRepostedByMe) return;
    setLoading(true);

    try {
      await repostService.createRepost(actualPost._id);
      setIsRepostedByMe(true);
    } catch (err) {
      console.error("Repost failed", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const formatDate = date =>
    new Date(date).toLocaleDateString();

  /* ---------------- RENDER ---------------- */

  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50">

      {isRepost && repostedBy && (
        <div className="text-xs text-gray-500 mb-1">
          🔁 Reposted by @{repostedBy.username}
        </div>
      )}

      <div className="flex gap-3">
        <img
          src={creator?.avatar || "https://via.placeholder.com/48"}
          className="w-12 h-12 rounded-full object-cover"
          alt="avatar"
        />

        <div className="flex-1">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <span className="font-semibold">@{creator?.username}</span>
              <span className="text-gray-500 text-sm">
                · {formatDate(actualPost.createdAt)}
              </span>
            </div>

            {!isOwnPost && (
              <button
                onClick={toggleFollow}
                disabled={loading}
                className={`text-sm font-semibold ${
                  isFollowing
                    ? "text-gray-500 hover:text-gray-700"
                    : "text-blue-500 hover:text-blue-700"
                }`}
              >
                {!isMe && (isFollowing ? "Following" : "Follow")}
              </button>
            )}
          </div>

          {/* CONTENT */}
          {content.text && <p className="mt-2">{content.text}</p>}

          {content.imageUrl?.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {content.imageUrl.map((img, i) => (
                <img key={i} src={img} className="rounded-lg" />
              ))}
            </div>
          )}

          {content.videoUrl && (
            <video
              src={content.videoUrl}
              controls
              className="mt-3 rounded-lg"
            />
          )}

          {/* ACTIONS */}
          <div className="flex gap-6 mt-3 text-gray-500">
            <button onClick={toggleLike} className={isLiked ? "text-red-500" : ""}>
              ❤️ {likesCount}
            </button>

            <button
              onClick={handleRepost}
              disabled={isRepostedByMe}
              className={
                isRepostedByMe
                  ? "text-green-600 cursor-not-allowed"
                  : "hover:text-green-600"
              }
            >
              🔁 {isRepostedByMe ? "Reposted" : "Repost"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
