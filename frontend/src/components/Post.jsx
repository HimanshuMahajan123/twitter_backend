import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { likeService } from '../services/likeService';
import { followService } from '../services/followService';

const Post = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLikeStatus();
  }, [post._id]);

  const checkLikeStatus = async () => {
    try {
      const response = await likeService.isPostLiked(post._id);
      setIsLiked(response.data?.isLiked || false);
    } catch (err) {
      console.error('Error checking like status:', err);
    }
  };

  const handleLike = async () => {
    try {
      setLoading(true);
      if (isLiked) {
        await likeService.removeLike(post._id);
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await likeService.addLike(post._id);
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setLoading(true);
      if (isFollowing) {
        await followService.removeFollow(post.creator._id);
        setIsFollowing(false);
      } else {
        await followService.addFollow(post.creator._id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const creator = post.creator || {};
  const content = post.content || {};
  const isOwnPost = user?._id === creator._id;

  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        <img
          src={creator.avatar || creator.profilePicture || 'https://via.placeholder.com/48'}
          alt={creator.username || 'User'}
          className="w-12 h-12 rounded-full object-cover bg-gray-200"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/48';
          }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold">{creator.name || creator.username || 'Unknown'}</span>
              <span className="text-gray-500">@{creator.username || 'unknown'}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">{formatDate(post.createdAt)}</span>
            </div>
            {!isOwnPost && (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-twitter-blue text-white hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {content.text && (
            <p className="mb-3 text-gray-900 whitespace-pre-wrap">{content.text}</p>
          )}

          {content.linkUrl && (
            <a
              href={content.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-twitter-blue hover:underline mb-3 block"
            >
              {content.linkUrl}
            </a>
          )}

          {content.imageUrl && content.imageUrl.length > 0 && (
            <div className={`grid gap-2 mb-3 ${
              content.imageUrl.length === 1 ? 'grid-cols-1' :
              content.imageUrl.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {content.imageUrl.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Post image ${index + 1}`}
                  className="w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {content.videoUrl && (
            <div className="mb-3">
              <video
                src={content.videoUrl}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}

          <div className="flex items-center space-x-6 mt-3 text-gray-500">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 hover:text-twitter-blue transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;