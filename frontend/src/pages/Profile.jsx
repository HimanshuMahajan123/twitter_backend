import React from "react";
import { useEffect , useState } from "react";

const TwitterDashboard = ({ data }) => {

    const [user , setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [posts , setPosts] = useState(data?.posts || []); 
    const [showFollowers , setShowFollowers] = useState(false);
    const [showFollowing , setShowFollowing] = useState(false); 
    const fetchDashboard = async () => {    
        try {
            const response = await userService.getUserDashboard();
            return response.data.data;
        } catch (error) {
            console.error("Error fetching dashboard:", error);
            throw error;
        }

    }
    const fetchFollowers = async () => {    
        try {
            const response = await userService.getUserFollowers(user._id);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching followers:", error);
            throw error;
        }

    }
    const fetchFollowing = async () => {    
        try {
            const response = await userService.getUserFollowing(user._id);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching following:", error);
            throw error;
        }

    }   
    useEffect(() => {
        fetchDashboard().then(data => {
            setUser(data.user);
            setPosts(data.posts);
        }).catch(error => {
            console.error("Error fetching dashboard:", error);
        });
    }, []);


    

  return (
    <div className="min-h-screen bg-gray-100 grid grid-cols-12">
      {/* LEFT SIDEBAR */}
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 border-r bg-white p-6">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.avatar}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover"
          />

          <h3 className="mt-3 font-semibold text-lg">{user.name}</h3>
          <p className="text-gray-500">@{user.username}</p>
          <p className="text-xs text-gray-400 mt-1">{user.email}</p>

          {!user.isEmailVerified && (
            <span className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">
              Email not verified
            </span>
          )}
        </div>
      </aside>

      {/* FEED */}
      <main className="col-span-12 md:col-span-6 lg:col-span-7 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Home</h2>

        {posts.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">
            <p className="text-lg font-medium">No posts yet</p>
            <span className="text-sm">
              Follow people to see posts here
            </span>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              {/* POST HEADER */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={post.creator.avatar || "/images/default-avatar.png"}
                    alt="creator"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">
                      {post.creator.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* POST CONTENT */}
              {post.content?.text && (
                <p className="text-gray-800 mt-2">
                  {post.content.text}
                </p>
              )}

              {/* IMAGES */}
              {post.content?.imageUrl?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {post.content.imageUrl.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="post"
                      className="rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-around mt-4 text-sm text-gray-600">
                <span className="hover:text-red-500 cursor-pointer">
                  ❤️ {post.likesCount}
                </span>
                <span className="hover:text-blue-500 cursor-pointer">
                  💬 {post.commentsCount}
                </span>
                <span className="hover:text-green-500 cursor-pointer">
                  🔁 {post.repostsCount}
                </span>
              </div>
            </div>
          ))
        )}
      </main>

   
    </div>
  );
};

export default TwitterDashboard;
