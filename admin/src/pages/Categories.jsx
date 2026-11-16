import { useEffect, useState } from "react";
import { categoriesApi } from "../services/api";

const initialForm = {
  name: "",
  description: "",
  color: "#f3ba2f",
  image: "",
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await categoriesApi.list();

      setCategories(
        Array.isArray(response) ? response : response.data || []
      );
    } catch (err) {
      setError(err.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.name.trim().length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: form.name.trim(),
        description: form.description.trim(),
        color: form.color,
        image: form.image.trim(),
      };

      if (editingId) {
        await categoriesApi.update(editingId, categoryData);
        setSuccess("Category updated successfully.");
      } else {
        await categoriesApi.create(categoryData);
        setSuccess("Category created successfully.");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(err.message || "Unable to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id || category.id);

    setForm({
      name: category.name || "",
      description: category.description || "",
      color: category.color || "#f3ba2f",
      image: category.image || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Delete the category "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await categoriesApi.delete(category._id || category.id);

      setCategories((current) =>
        current.filter(
          (item) =>
            String(item._id || item.id) !==
            String(category._id || category.id)
        )
      );

      if (
        String(editingId) ===
        String(category._id || category.id)
      ) {
        resetForm();
      }

      setSuccess("Category deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete category.");
    }
  };

  return (
    <div className="categories-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">
            CONTENT ORGANIZATION
          </span>

          <h2>Categories</h2>

          <p>
            Organize your cryptocurrency, technology and other articles.
          </p>
        </div>
      </div>

      <section className="dashboard-panel category-list-panel">
        <div className="panel-heading">
          <div>
            <h3>{editingId ? "Edit category" : "Create category"}</h3>
            <p>
              Add a topic that readers can use to explore your articles.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <label className="editor-label" htmlFor="category-name">
            Category name
          </label>

          <input
            id="category-name"
            type="text"
            placeholder="e.g. DeFi"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            minLength={2}
            maxLength={100}
          />

          <label className="editor-label" htmlFor="category-description">
            Description
          </label>

          <textarea
            id="category-description"
            rows="3"
            placeholder="Describe what this category covers..."
            value={form.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
          />

          <label className="editor-label" htmlFor="category-color">
            Category colour
          </label>

          <input
            id="category-color"
            type="color"
            value={form.color}
            onChange={(e) => updateField("color", e.target.value)}
          />

          <label className="editor-label" htmlFor="category-image">
            Category image URL (optional)
          </label>

          <input
            id="category-image"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={(e) => updateField("image", e.target.value)}
          />

          {error && (
            <p className="editor-message" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="editor-message" role="status">
              {success}
            </p>
          )}

          <div className="category-form-actions">
            <button
              type="submit"
              className="primary-action"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update category"
                  : "Create category"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-action"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="dashboard-panel category-list-panel">
        <div className="panel-heading">
          <div>
            <h3>All categories</h3>
            <p>Manage the topics used to organize your articles.</p>
          </div>

          <span>{categories.length} categories</span>
        </div>

        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length > 0 ? (
          <div className="category-list">
            {categories.map((category) => (
              <div
                className="category-item"
                key={category._id || category.id}
              >
                <div
                  className="category-initial"
                  style={{
                    backgroundColor: category.color || "#f3ba2f",
                  }}
                >
                  {category.name?.charAt(0).toUpperCase()}
                </div>

                <div className="category-info">
                  <strong>{category.name}</strong>
                  <span>
                    {category.description || "No description"}
                  </span>
                </div>

                <span className="category-articles">
                  {category.post_count ?? category.articleCount ?? 0} articles
                </span>

                <div className="posts-actions">
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => handleDelete(category)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="categories-empty">
            <div className="media-empty-icon">▦</div>
            <h3>No categories available</h3>
            <p>Create your first category using the form above.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Categories;
