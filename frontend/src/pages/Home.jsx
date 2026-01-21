import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { postService } from "../services/postService";
import Post from "../components/Post";
import PostCreate from "../components/PostCreate";
import Sidebar from "../components/Sidebar";
import Trends from "../components/Trends";

const Home = () => {
  const { user, logout } = useAuth();

  const [feed, setFeed] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ------------------------------------------------ */
  /* FETCH FEED                                       */
  /* ------------------------------------------------ */

  const fetchFeed = async (reset = false) => {
    try {
      setLoading(true);

      const res = await postService.fetchFeedPosts(
        reset ? null : cursor
      );

      const newItems = res?.posts || [];
      const nextCursor = res?.nextCursor || null;
      console.log("Fetched feed:", newItems, nextCursor);
      setFeed((prev) =>
        reset ? newItems : [...prev, ...newItems]
      );
      setCursor(nextCursor);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load feed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------ */
  /* INITIAL LOAD                                    */
  /* ------------------------------------------------ */

  useEffect(() => {
    fetchFeed(true);
  }, []);

  /* ------------------------------------------------ */
  /* POST CREATED HANDLER                             */
  /* ------------------------------------------------ */

  const handlePostCreated = () => {
    setCursor(null);
    fetchFeed(true);
  };

  /* ------------------------------------------------ */
  /* FEED KEY GENERATOR (CRITICAL)                    */
  /* ------------------------------------------------ */

  const getFeedKey = (item) => {
    // REPOST
    if (item.type === "REPOST") {
      return `repost-${item.post?._id}-${item.repostedBy?._id}`;
    }

    // NORMAL POST
    if (item._id) {
      return `post-${item._id}`;
    }

    // ABSOLUTE FALLBACK (should never hit)
    return `fallback-${Math.random()}`;
  };

  /* ------------------------------------------------ */
  /* RENDER                                          */
  /* ------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-4 py-4">

          {/* LEFT SIDEBAR */}
          <div className="col-span-3">
            <Sidebar user={user} onLogout={logout} />
          </div>

          {/* MAIN FEED */}
          <div className="col-span-6 border-x border-gray-200 bg-white">

            {/* HEADER */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-0">
              <h1 className="text-xl font-bold">Home</h1>
            </div>

            {/* CREATE POST */}
            <PostCreate onPostCreated={handlePostCreated} />

            {/* FEED */}
            {feed.length === 0 && !loading && !error && (
              <div className="p-8 text-center text-gray-500">
                No posts yet. Follow users or create your first post.
              </div>
            )}

            {feed.map((item) => (
              <Post
                key={getFeedKey(item)}
                post={item}
              />
            ))}

            {/* LOAD MORE */}
            {!loading && cursor && (
              <button
                onClick={() => fetchFeed()}
                className="w-full py-4 text-sm font-semibold text-[#1DA1F2] hover:bg-gray-50"
              >
                Load more
              </button>
            )}

            {/* LOADING */}
            {loading && (
              <div className="p-6 text-center text-gray-500">
                Loading…
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="p-6 text-center text-red-500">
                {error}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-3">
            <Trends />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
