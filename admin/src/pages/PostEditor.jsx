
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  postsApi,
  categoriesApi,
  mediaApi,
} from "../services/api";

function PostEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category_id: "",
    featuredImage: "",
    content: "",
    seoTitle: "",
    metaDescription: "",
  });

  const [status, setStatus] = useState("draft");

  // Load categories and existing article.
  useEffect(() => {
    let active = true;

    const loadEditorData = async () => {
      try {
        setError("");

        const categoryResponse = await categoriesApi.list();

        const categoryData = Array.isArray(categoryResponse)
          ? categoryResponse
          : categoryResponse.data || [];

        if (active) {
          setCategories(categoryData);
        }

        if (isEditing) {
          const response = await postsApi.get(id);
          const post = response.data;

          if (!post) {
            throw new Error("Article not found.");
          }

          if (active) {
            setForm({
              title: post.title || "",
              slug: post.slug || "",
              excerpt: post.excerpt || "",
              category_id: post.category_id || "",
              featuredImage: post.featured_image || "",
              content: post.content || "",
              seoTitle: post.meta_title || "",
              metaDescription: post.meta_desc || "",
            });

            setStatus(post.status || "draft");
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load editor data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEditorData();

    return () => {
      active = false;
    };
  }, [id, isEditing]);

  // Update a form field.
  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // Generate URL-friendly slug.
  const generateSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Upload an image from the computer.
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, GIF, WEBP or SVG image.");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must not exceed 10 MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const response = await mediaApi.upload(file);

      const uploadedFile = Array.isArray(response)
        ? response[0]
        : response.data?.[0];

      if (!uploadedFile?.url) {
        throw new Error(
          "Upload completed, but the server did not return an image URL."
        );
      }

      updateField("featuredImage", uploadedFile.url);

      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Save draft or publish article.
  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (uploading) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setError("Please enter an article title and content.");
      return;
    }

    const newStatus = publish ? "published" : "draft";

    const articleData = {
      title: form.title.trim(),
      slug: form.slug.trim() || generateSlug(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content,
      featured_image: form.featuredImage.trim(),
      category_id: form.category_id || undefined,
      status: newStatus,
      visibility: "public",
      meta_title: form.seoTitle.trim(),
      meta_desc: form.metaDescription.trim(),
    };

    try {
      setSaving(true);

      if (isEditing) {
        await postsApi.update(id, articleData);
      } else {
        await postsApi.create(articleData);
      }

      setStatus(newStatus);

      setMessage(
        publish
          ? "Article published successfully."
          : "Draft saved successfully."
      );

      setTimeout(() => {
        navigate("/posts");
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to save the article.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="posts-page">
        <p>Loading article...</p>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">
            CONTENT MANAGEMENT
          </span>

          <h2>{isEditing ? "Edit article" : "Create article"}</h2>

          <p>
            Write, organise and prepare your next publication.
          </p>
        </div>

        <Link to="/posts" className="secondary-action">
          ← Back to articles
        </Link>
      </div>

      <form
        className="editor-layout"
        onSubmit={(e) => handleSubmit(e, false)}
      >
        <div className="editor-main">
          {/* Article details */}
          <section className="dashboard-panel editor-section">
            <label
              className="editor-label"
              htmlFor="article-title"
            >
              Article title
            </label>

            <input
              id="article-title"
              className="editor-title-input"
              placeholder="Enter an engaging article title..."
              value={form.title}
              onChange={(e) => {
                const value = e.target.value;

                setForm((current) => ({
                  ...current,
                  title: value,
                  slug: generateSlug(value),
                }));
              }}
            />

            <label
              className="editor-label"
              htmlFor="article-slug"
            >
              URL slug
            </label>

            <input
              id="article-slug"
              placeholder="article-url-slug"
              value={form.slug}
              onChange={(e) =>
                updateField("slug", generateSlug(e.target.value))
              }
            />

            <label
              className="editor-label"
              htmlFor="article-excerpt"
            >
              Article excerpt
            </label>

            <textarea
              id="article-excerpt"
              rows="3"
              placeholder="Write a short introduction for your article..."
              value={form.excerpt}
              onChange={(e) =>
                updateField("excerpt", e.target.value)
              }
            />
          </section>

          {/* Article content */}
          <section className="dashboard-panel editor-section">
            <div className="editor-section-heading">
              <h3>Article content</h3>
              <span>MAIN BODY</span>
            </div>

            <textarea
              className="article-content-input"
              placeholder="Start writing your article here..."
              value={form.content}
              onChange={(e) =>
                updateField("content", e.target.value)
              }
              rows="20"
            />

            <p className="editor-helper">
              Write your article content in the editor.
            </p>
          </section>

          {/* SEO settings */}
          <section className="dashboard-panel editor-section">
            <h3>SEO settings</h3>

            <label
              className="editor-label"
              htmlFor="seo-title"
            >
              SEO title
            </label>

            <input
              id="seo-title"
              placeholder="Search engine title"
              value={form.seoTitle}
              onChange={(e) =>
                updateField("seoTitle", e.target.value)
              }
            />

            <label
              className="editor-label"
              htmlFor="meta-description"
            >
              Meta description
            </label>

            <textarea
              id="meta-description"
              rows="3"
              placeholder="Describe this article for search engines..."
              value={form.metaDescription}
              onChange={(e) =>
                updateField("metaDescription", e.target.value)
              }
            />
          </section>
        </div>

        <aside className="editor-sidebar">
          {/* Publication settings */}
          <section className="dashboard-panel editor-section">
            <h3>Publication</h3>

            <label
              className="editor-label"
              htmlFor="category"
            >
              Category
            </label>

            <select
              id="category"
              value={form.category_id}
              onChange={(e) =>
                updateField("category_id", e.target.value)
              }
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option
                  key={category._id || category.id}
                  value={category._id || category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <div className="editor-status">
              <span className="editor-label">
                Current status
              </span>

              <span className={`post-status ${status}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>

            <button
              type="button"
              className="secondary-action full-width"
              disabled={saving || uploading}
              onClick={(e) => handleSubmit(e, false)}
            >
              {saving ? "Saving..." : "Save as draft"}
            </button>

            <button
              type="button"
              className="primary-action full-width"
              disabled={saving || uploading}
              onClick={(e) => handleSubmit(e, true)}
            >
              {saving ? "Saving..." : "Publish article →"}
            </button>

            {message && (
              <p className="editor-message">{message}</p>
            )}

            {error && (
              <p className="editor-message" role="alert">
                {error}
              </p>
            )}
          </section>

          {/* Featured image upload */}
          <section className="dashboard-panel editor-section">
            <h3>Featured image</h3>

            <label
              className="editor-label"
              htmlFor="featured-image-upload"
            >
              Upload from your computer
            </label>

            <input
              id="featured-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleImageUpload}
              disabled={uploading || saving}
            />

            {uploading && (
              <p className="editor-helper">
                Uploading image...
              </p>
            )}

            <p className="editor-helper">
              JPG, PNG, GIF, WEBP or SVG. Maximum size: 10 MB.
            </p>

            <label
              className="editor-label"
              htmlFor="featured-image"
            >
              Or enter an image URL
            </label>

            <input
              id="featured-image"
              placeholder="https://example.com/image.jpg"
              value={form.featuredImage}
              onChange={(e) =>
                updateField("featuredImage", e.target.value)
              }
            />

            {form.featuredImage && (
              <img
                className="editor-image-preview"
                src={form.featuredImage}
                alt="Featured article preview"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "block";
                }}
              />
            )}

            <p className="editor-helper">
              The image URL will be saved with your article.
            </p>
          </section>
        </aside>
      </form>
    </div>
  );
}

export default PostEditor;
