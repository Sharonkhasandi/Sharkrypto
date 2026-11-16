
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import "./Home.css";
import { postsApi, settingsApi } from "../services/api";

const topics = [
  "All",
  "DeFi",
  "NFTs",
  "Metaverse",
  "Web 3",
  "Regulation",
  "AI",
  "Blockchain",
  "Crypto Projects",
  "Technology",
];

function getArticleId(article) {
  return String(article.id || article._id || "");
}

function getImage(article) {
  const image = article.featured_image;

  if (
    typeof image === "string" &&
    (image.startsWith("https://") ||
      image.startsWith("http://") ||
      image.startsWith("/"))
  ) {
    return image;
  }

  return null;
}

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function ArticleCard({ article }) {
  const image = getImage(article);

  return (
    <Link to={`/blog/${article.slug}`} className="article-card">
      {image ? (
        <img src={image} alt={article.title || "Article image"} />
      ) : (
        <div className="article-image-placeholder" />
      )}

      <div className="article-overlay">
        <span className="article-category">
          {article.category_name || "GENERAL"}
        </span>

        <h2>{article.title}</h2>
      </div>
    </Link>
  );
}

function getHomepageStoryIds(settings) {
  try {
    const value = settings?.homepage_stories;

    if (!value) return [];

    const parsed =
      typeof value === "string" ? JSON.parse(value) : value;

    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [homepageStoryIds, setHomepageStoryIds] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("q") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchOpen = searchParams.get("search") === "1";

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function loadHomepage() {
      try {
        setLoading(true);
        setError("");

        const [postsResponse, settingsResponse] = await Promise.all([
          postsApi.list(),
          settingsApi.get(),
        ]);

        const articles = Array.isArray(postsResponse)
          ? postsResponse
          : postsResponse.data || [];

        const settings = settingsResponse.data || settingsResponse;

        if (active) {
          setPosts(articles);
          setHomepageStoryIds(getHomepageStoryIds(settings));
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load homepage stories."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHomepage();

    return () => {
      active = false;
    };
  }, []);

  const homepagePosts = useMemo(() => {
    if (homepageStoryIds.length === 0) {
      return posts.slice(0, 5);
    }

    const postsById = new Map(
      posts.map((post) => [getArticleId(post), post])
    );

    return homepageStoryIds
      .map((id) => postsById.get(String(id)))
      .filter(Boolean)
      .slice(0, 5);
  }, [posts, homepageStoryIds]);

  const filteredPosts = useMemo(() => {
    if (selectedTopic === "All") {
      return homepagePosts;
    }

    const topic = selectedTopic.toLowerCase();

    return homepagePosts.filter((post) => {
      const category = (
        post.category_name ||
        post.category?.name ||
        ""
      ).toLowerCase();

      const tags = (post.tags || []).map((tag) =>
        String(tag).toLowerCase()
      );

      return (
        category.includes(topic) ||
        tags.includes(topic)
      );
    });
  }, [homepagePosts, selectedTopic]);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return [];

    return posts.filter((post) => {
      const category =
        post.category_name || post.category?.name || "";

      const tags = Array.isArray(post.tags)
        ? post.tags.map((tag) => String(tag)).join(" ")
        : "";

      const searchableContent = [
        post.title,
        post.excerpt,
        stripHtml(post.content || ""),
        category,
        tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(term);
    });
  }, [posts, searchTerm]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const term = searchTerm.trim();

    setSearchParams(
      term
        ? { search: "1", q: term }
        : { search: "1" }
    );
  }

  function closeSearch() {
    setSearchTerm("");
    setSearchParams({});
  }

  const heroPost = filteredPosts[0];
  const sidePosts = filteredPosts.slice(1, 5);

  return (
    <main className="home-page">
      <section className="home-heading">
        <div>
          <h1>
            Crypto Trends <span>Today.</span>
          </h1>

          <p>
            Cryptocurrency, technology and information
            shaping our digital world.
          </p>
        </div>
      </section>

      {searchOpen && (
        <section className="home-search-section">
          <form
            className="home-search-form"
            onSubmit={handleSearchSubmit}
          >
            <Search size={20} />

            <input
              type="search"
              placeholder="Search articles, topics or keywords..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              autoFocus
              aria-label="Search articles"
            />

            {searchTerm && (
              <button
                type="button"
                className="home-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

            <button
              type="submit"
              className="home-search-submit"
            >
              Search
            </button>

            <button
              type="button"
              className="home-search-close"
              onClick={closeSearch}
              aria-label="Close search"
              title="Close search"
            >
              <X size={20} />
            </button>
          </form>
        </section>
      )}

      {!searchOpen && (
        <section
          className="topic-filter"
          aria-label="Article topics"
        >
          {topics.map((topic) => (
            <button
              className={
                selectedTopic === topic
                  ? "topic-button active"
                  : "topic-button"
              }
              key={topic}
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </section>
      )}

      {loading && (
        <div className="articles-message">
          <p>Loading the latest stories...</p>
        </div>
      )}

      {!loading && error && (
        <div className="articles-message error-message">
          <h2>Unable to load stories</h2>
          <p>{error}</p>

          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && searchOpen && (
        <section className="home-search-results">
          <div className="home-search-results-heading">
            <h2>
              {searchTerm.trim()
                ? `Results for "${searchTerm.trim()}"`
                : "Search articles"}
            </h2>

            {searchTerm.trim() && (
              <span>{searchResults.length} found</span>
            )}
          </div>

          {!searchTerm.trim() && (
            <p className="home-search-message">
              Enter a keyword to search all published articles.
            </p>
          )}

          {searchTerm.trim() && searchResults.length === 0 && (
            <div className="home-search-empty">
              <Search size={30} />
              <h3>No matching articles found</h3>
              <p>Try another keyword or a broader topic.</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="home-search-grid">
              {searchResults.map((article) => (
                <ArticleCard
                  article={article}
                  key={getArticleId(article)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && !error && !searchOpen &&
        filteredPosts.length === 0 && (
          <div className="articles-message">
            <h2>No articles found</h2>

            <p>
              {posts.length === 0
                ? "Published stories will appear here when they are available."
                : `There are no selected stories under ${selectedTopic}.`}
            </p>
          </div>
        )}

      {!loading && !error && !searchOpen && heroPost && (
        <section className="hero-grid">
          <div className="hero-main">
            <ArticleCard article={heroPost} />
          </div>

          {sidePosts.length > 0 && (
            <div className="hero-side">
              {sidePosts.map((article) => (
                <ArticleCard
                  article={article}
                  key={getArticleId(article)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
