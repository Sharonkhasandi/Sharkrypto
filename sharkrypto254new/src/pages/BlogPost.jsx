import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { postsApi } from "../services/api";
import "./BlogPost.css";

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogPost() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadArticle() {
      setLoading(true);
      setError("");
      setArticle(null);

      try {
        const response = await postsApi.get(slug);
        const post = response?.data || response;

        if (!post || !post.title) {
          throw new Error("This article could not be found.");
        }

        if (isMounted) {
          setArticle(post);
        }

        try {
          const postsResponse = await postsApi.list();
          const posts = Array.isArray(postsResponse)
            ? postsResponse
            : postsResponse?.data || [];

          if (isMounted) {
            setRelatedArticles(
              posts
                .filter(
                  (item) =>
                    item.slug !== post.slug &&
                    item.status === "published"
                )
                .slice(0, 3)
            );
          }
        } catch {
          // The main article can still display if related posts fail.
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load this article.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="blog-post-container">
        <div className="blog-post-state">Loading article...</div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="blog-post-container">
        <div className="blog-post-state">
          <h1>Article unavailable</h1>
          <p>{error || "The article could not be found."}</p>
          <Link to="/" className="back-home-link">
            Back to homepage
          </Link>
        </div>
      </main>
    );
  }

  const image = article.featured_image;
  const category =
    article.category_name || article.category?.name || "Technology";
  const publishedDate = formatDate(
    article.published_at || article.created_at
  );

  return (
    <main className="blog-post-container">
      <div className="blog-post-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>{category}</span>
      </div>

      <article className="blog-post">
        <header className="blog-post-header">
          <Link
            to={`/category/${article.category_slug || ""}`}
            className="blog-post-category"
          >
            {category}
          </Link>

          <h1>{article.title}</h1>

          {article.excerpt && (
            <p className="blog-post-excerpt">{article.excerpt}</p>
          )}

          <div className="blog-post-meta">
            {publishedDate && <span>{publishedDate}</span>}
          </div>
        </header>

        {image && (
          <div className="blog-post-featured-image">
            <img src={image} alt={article.title} />
          </div>
        )}

        <div className="blog-post-content">
          {article.content ? (
            <div
              dangerouslySetInnerHTML={{
                 __html: DOMPurify.sanitize(article.content,{
                    USE_PROFILES: { html: true }, 
                  }),
                }}
            />
          ) : (
            <p>There is no article available.</p>
          )}
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="related-articles">
          <h2>More Stories</h2>

          <div className="related-articles-grid">
            {relatedArticles.map((item) => (
              <Link
                to={`/blog/${item.slug}`}
                className="related-article-card"
                key={item.id || item._id || item.slug}
              >
                {item.featured_image && (
                  <img src={item.featured_image} alt={item.title} />
                )}

                <div className="related-article-info">
                  <span>
                    {item.category_name || "Technology"}
                  </span>
                  <h3>{item.title}</h3>
                  <small>{formatDate(item.published_at || item.created_at)}</small>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default BlogPost;
