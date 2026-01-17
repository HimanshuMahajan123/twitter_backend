import { Link } from 'react-router-dom';

const Sidebar = ({ user, onLogout }) => {
  console.log('Sidebar user:', user);
  return (
    <div className="sticky top-4 space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-twitter-blue mb-4">Y.com</h2>
        
        <nav className="space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span>🏠</span>
            <span className="font-semibold">Home</span>
          </Link>
        </nav>

        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3">
              <img
                src={user.avatar || 'https://via.placeholder.com/40'}
                alt={user.username || 'User'}
                className="w-10 h-10 rounded-full object-cover bg-gray-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/40';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name || user.username}</p>
                <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full mt-2 px-4 py-2 bg-twitter-blue text-white rounded-full font-semibold hover:bg-blue-600 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;