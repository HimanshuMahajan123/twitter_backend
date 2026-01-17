import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { authService } from '../services/authService';
import Post from '../components/Post';
import PostCreate from '../components/PostCreate';
import Sidebar from '../components/Sidebar';

const Home = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getFeedPosts();
      setPosts(response.data?.posts || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-4 py-4">
          {/* Sidebar */}
          <div className="col-span-3">
            <Sidebar user={user} onLogout={handleLogout} />
          </div>

          {/* Main Content */}
          <div className="col-span-6 border-x border-gray-200 bg-white">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
              <h1 className="text-xl font-bold">Home</h1>
            </div>

            {/* Post Creation */}
            <PostCreate onPostCreated={handlePostCreated} />

            {/* Feed */}
            <div>
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading posts...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No posts yet. Create your first post or follow some users!
                </div>
              ) : (
                posts.map((post) => (
                  <Post key={post._id} post={post} onUpdate={fetchPosts} />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <h2 className="text-lg font-bold mb-2">Trends</h2>
                <p className="text-sm text-gray-600">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;