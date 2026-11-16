import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { postsApi } from "../services/api";
import "./News.css";

const preferredCategories = [
  "News",
  "Investments",
  "Regulation",
  "Technology",
  "Guest posts",
  "Analytics",
];

function getCategory(article) {
  return article.category_name || article.category?.name || "General";
}

function getDate(article) {
  const date = new Date(article.published_at || article.created_at);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function getExcerpt(article) {
  if (article.excerpt) return article.excerpt;

  return (article.content || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function ArticleImage({ article, className = "" }) {
  const image = article.featured_image;

  if (
    typeof image === "string" &&
    (image.startsWith("https://") ||
      image.startsWith("http://") ||
      image.startsWith("/"))
  ) {
    return (
      <img
        className={className}
        src={image}
        alt=""
        loading="lazy"
      />
    );
  }

  return <div className={`${className} news-image-placeholder`} />;
}

function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("q") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCategory = searchParams.get("category") || "All articles";

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        const response = await postsApi.list();
        const result = Array.isArray(response)
          ? response
          : response?.data || [];

        if (active) setArticles(result);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load news articles.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadArticles();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
  }, [searchParams]);

  const categories = useMemo(() => {
    const available = new Set(articles.map(getCategory));
    const ordered = preferredCategories.filter((category) =>
      available.has(category)
    );
    const additional = [...available]
      .filter((category) => !preferredCategories.includes(category))
      .sort((a, b) => a.localeCompare(b));

    return ["All articles", ...ordered, ...additional];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const categoryFiltered =
      selectedCategory === "All articles"
        ? articles
        : articles.filter(
            (article) =>
              getCategory(article).toLowerCase() ===
              selectedCategory.toLowerCase()
          );
    const term = searchTerm.trim().toLowerCase();

    if (!term) return categoryFiltered;

    return categoryFiltered.filter((article) =>
      [
        article.title,
        article.excerpt,
        article.content,
        getCategory(article),
      ]
        .filter(Boolean)
        .join(" ")
        .replace(/<[^>]*>/g, " ")
        .toLowerCase()
        .includes(term)
    );
  }, [articles, searchTerm, selectedCategory]);

  function chooseCategory(category) {
    const next = new URLSearchParams(searchParams);
    if (category === "All articles") {
      next.delete("category");
    } else {
      next.set("category", category);
    }
    setSearchParams(next);
  }

  function updateSearch(value) {
    setSearchTerm(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  }

  const latestArticles = articles.slice(0, 5);

  return (
    <main className="news-page">
      <div className="news-layout">
        <section className="news-feed">
          <div className="news-heading">
            <div>
              <span className="news-eyebrow">Sharkrypto254</span>
              <h1>Crypto news</h1>
              <p>Latest stories, market analysis and ideas from the crypto world.</p>
            </div>

            <label className="news-search">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search articles"
                value={searchTerm}
                onChange={(event) => updateSearch(event.target.value)}
                aria-label="Search articles"
              />
            </label>
          </div>

          <nav className="news-categories" aria-label="News categories">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  selectedCategory.toLowerCase() === category.toLowerCase()
                    ? "news-category-button active"
                    : "news-category-button"
                }
                onClick={() => chooseCategory(category)}
              >
                {category}
              </button>
            ))}
          </nav>

          {loading && (
            <div className="news-state">Loading the latest articles...</div>
          )}

          {!loading && error && (
            <div className="news-state news-error">
              <h2>Unable to load news</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filteredArticles.length === 0 && (
            <div className="news-state">
              <h2>No articles found</h2>
              <p>Try another category or search term.</p>
            </div>
          )}

          {!loading && !error && filteredArticles.length > 0 && (
            <div className="news-article-list">
              {filteredArticles.map((article) => (
                <article
                  className="news-article-row"
                  key={article.id || article._id || article.slug}
                >
                  <Link
                    to={`/blog/${article.slug}`}
                    className="news-article-image"
                    aria-label={`Read ${article.title}`}
                  >
                    <ArticleImage article={article} />
                    <span className="news-image-category">
                      {getCategory(article)}
                    </span>
                  </Link>

                  <div className="news-article-copy">
                    <Link
                      to={`/blog/${article.slug}`}
                      className="news-article-title"
                    >
                      {article.title}
                    </Link>
                    <p>{getExcerpt(article)}</p>
                    <time>
                      {getDate(article)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="news-sidebar">
          <section className="latest-news">
            <h2>Latest news</h2>
            <div className="latest-news-list">
              {latestArticles.map((article) => (
                <Link
                  to={`/blog/${article.slug}`}
                  className="latest-news-item"
                  key={article.id || article._id || article.slug}
                >
                  <ArticleImage
                    article={article}
                    className="latest-news-image"
                  />
                  <span>{article.title}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

export default News;
