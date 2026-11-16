
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { postsApi } from "../services/api";

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await postsApi.list();
      const articles = Array.isArray(response)
        ? response
        : response.data || [];

      setPosts(articles);
    } catch (err) {
      setError(err.message || "Unable to load articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesFilter =
        filter === "all" || post.status === filter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        (post.title || "").toLowerCase().includes(searchText) ||
        (post.excerpt || "").toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [posts, filter, search]);

  const handleDelete = async (post) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${post.title}"?`
    );

    if (!confirmed) return;

    try {
      await postsApi.delete(post.id || post._id);
      setPosts((current) =>
        current.filter(
          (item) => (item.id || item._id) !== (post.id || post._id)
        )
      );
    } catch (err) {
      setError(err.message || "Unable to delete article.");
    }
  };

  const counts = {
    all: posts.length,
    published: posts.filter((post) => post.status === "published").length,
    draft: posts.filter((post) => post.status === "draft").length,
    scheduled: posts.filter((post) => post.status === "scheduled").length,
  };

  return (
    <div className="posts-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">CONTENT MANAGEMENT</span>
          <h2>All articles</h2>
          <p>Manage your drafts, published articles and scheduled posts.</p>
        </div>

        <Link to="/posts/new" className="primary-action">
          + Create article
        </Link>
      </div>

      <div className="posts-summary">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All articles <strong>{counts.all}</strong>
        </button>

        <button
          className={filter === "published" ? "active" : ""}
          onClick={() => setFilter("published")}
        >
          Published <strong>{counts.published}</strong>
        </button>

        <button
          className={filter === "draft" ? "active" : ""}
          onClick={() => setFilter("draft")}
        >
          Drafts <strong>{counts.draft}</strong>
        </button>

        <button
          className={filter === "scheduled" ? "active" : ""}
          onClick={() => setFilter("scheduled")}
        >
          Scheduled <strong>{counts.scheduled}</strong>
        </button>
      </div>

      <section className="dashboard-panel">
        <div className="posts-toolbar">
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className="secondary-action"
            onClick={loadPosts}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="editor-message" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading articles...</p>
        ) : filteredPosts.length === 0 ? (
          <div className="posts-empty">
            <h3>No articles found</h3>
            <p>
              {posts.length === 0
                ? "Your articles will appear here after they are saved."
                : "Try another search or select a different status."}
            </p>
            <Link to="/posts/new" className="primary-action">
              Create your first article
            </Link>
          </div>
        ) : (
          <div className="posts-table-wrapper">
            <table className="posts-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id || post._id}>
                    <td>
                      <strong>{post.title}</strong>
                      <p>{post.excerpt || "No excerpt"}</p>
                    </td>

                    <td>{post.category_name || "Uncategorised"}</td>

                    <td>
                      <span className={`post-status ${post.status}`}>
                        {post.status || "unknown"}
                      </span>
                    </td>

                    <td>
                      {post.updated_at
                        ? new Date(post.updated_at).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>
                      <div className="posts-actions">
                        <Link
                          to={`/posts/${post.id || post._id}/edit`}
                          className="secondary-action"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="secondary-action"
                          onClick={() => handleDelete(post)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default PostsList;
