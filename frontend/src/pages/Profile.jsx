import { useEffect, useState } from "react";
import userService from "../services/userService";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await userService.getUserDashboard();
    const data = res.message;

    setUser(data.user);
    setPosts(data.posts || []);
    setFollowers(data.followers || []);
    setFollowing(data.following || []);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-12 gap-4 p-4">

        {/* MAIN */}
        <main className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow">

          {/* TABS */}
          <div className="flex border-b">
            {["posts", "followers", "following"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold capitalize
                  ${activeTab === tab
                    ? "border-b-2 border-[#1DA1F2] text-[#1DA1F2]"
                    : "text-gray-500 hover:bg-gray-50"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="p-4 space-y-4">

            {/* POSTS */}
            {activeTab === "posts" && (
              posts.length === 0 ? (
                <p className="text-center text-gray-500">No posts yet</p>
              ) : (
                posts.map(post => (
                  <div key={post._id} className="border rounded-lg p-4">

                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={post.creator.avatar}
                        className="w-10 h-10 rounded-full"
                        alt="avatar"
                      />
                      <div>
                        <p className="font-semibold">@{post.creator.username}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {post.content?.text && (
                      <p className="text-gray-800 mb-2">
                        {post.content.text}
                      </p>
                    )}

                    {post.content?.imageUrl?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {post.content.imageUrl.map((img, i) => (
                          <img key={i} src={img} className="rounded-lg" />
                        ))}
                      </div>
                    )}

                    {post.content?.videoUrl && (
                      <video
                        src={post.content.videoUrl}
                        controls
                        className="rounded-lg mb-2"
                      />
                    )}

                    <div className="flex justify-around text-sm text-gray-500 mt-3">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                      <span className={post.isRepostedByMe ? "text-green-600" : ""}>
                        🔁 {post.isRepostedByMe ? "Reposted" : post.repostsCount}
                      </span>
                    </div>

                  </div>
                ))
              )
            )}

            {/* FOLLOWERS */}
            {activeTab === "followers" && (
              followers.length === 0 ? (
                <p className="text-center text-gray-500">No followers yet</p>
              ) : (
                followers.map(f => (
                  <div key={f._id} className="flex items-center gap-3 border p-3 rounded-lg">
                    <img src={f.avatar} className="w-10 h-10 rounded-full" />
                    <span className="font-medium">@{f.username}</span>
                  </div>
                ))
              )
            )}

            {/* FOLLOWING */}
            {activeTab === "following" && (
              following.length === 0 ? (
                <p className="text-center text-gray-500">Not following anyone</p>
              ) : (
                following.map(f => (
                  <div key={f._id} className="flex items-center gap-3 border p-3 rounded-lg">
                    <img src={f.avatar} className="w-10 h-10 rounded-full" />
                    <span className="font-medium">@{f.username}</span>
                  </div>
                ))
              )
            )}

          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block col-span-4 bg-white rounded-xl shadow p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <img src={user.avatar} className="w-24 h-24 rounded-full" />
            <h3 className="mt-3 font-semibold text-lg">{user.name}</h3>
            <p className="text-gray-500">@{user.username}</p>

            {!user.isEmailVerified && (
              <span className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">
                Email not verified
              </span>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default UserDashboard;
