import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';

const PostCreate = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setVideo(null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    setImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text && !linkUrl && images.length === 0 && !video) {
      setError('Post content is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (linkUrl) formData.append('linkUrl', linkUrl);
      images.forEach((image) => formData.append('images', image));
      if (video) formData.append('video', video);

      await postService.createPost(formData);
      setText('');
      setLinkUrl('');
      setImages([]);
      setVideo(null);
      onPostCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-3">
          <img
            src={user?.avatar || 'https://via.placeholder.com/48'}
            alt={user?.username || 'User'}
            className="w-12 h-12 rounded-full object-cover bg-gray-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/48';
            }}
          />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-2 border-0 resize-none focus:outline-none focus:ring-0 text-lg"
              rows="3"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm px-4">{error}</div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 px-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {video && (
          <div className="px-4 relative">
            <video
              src={URL.createObjectURL(video)}
              controls
              className="w-full rounded-lg"
            />
            <button
              type="button"
              onClick={() => setVideo(null)}
              className="absolute top-2 right-6 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
            >
              ×
            </button>
          </div>
        )}

        <div className="px-4">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Add a link (optional)"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-twitter-blue"
          />
        </div>

        <div className="flex items-center justify-between px-4 pt-2 border-t border-gray-200">
          <div className="flex space-x-4">
            <label className="cursor-pointer text-twitter-blue hover:text-blue-600">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={!!video}
              />
              📷 Photos
            </label>
            <label className="cursor-pointer text-twitter-blue hover:text-blue-600">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                disabled={images.length > 0}
              />
              🎥 Video
            </label>
          </div>
          <button
            type="submit"
            disabled={loading || (!text && !linkUrl && images.length === 0 && !video)}
            className="bg-twitter-blue text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreate;