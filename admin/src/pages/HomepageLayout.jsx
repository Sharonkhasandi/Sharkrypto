
import { useEffect, useMemo, useState } from 'react';
import { postsApi, settingsApi } from '../services/api';
import './HomepageLayout.css';

const EMPTY_SLOTS = ['', '', '', '', ''];

const SLOT_LABELS = [
  'Main Story',
  'Small Story 1',
  'Small Story 2',
  'Small Story 3',
  'Small Story 4'
];

function getId(post) {
  return String(post.id || post._id || '');
}

function readSavedStories(settings) {
  try {
    const value = settings?.homepage_stories;

    if (!value) return EMPTY_SLOTS;

    const parsed = typeof value === 'string'
      ? JSON.parse(value)
      : value;

    if (!Array.isArray(parsed)) return EMPTY_SLOTS;

    return Array.from({ length: 5 }, (_, index) =>
      String(parsed[index] || '')
    );
  } catch {
    return EMPTY_SLOTS;
  }
}

export default function HomepageLayout() {
  const [posts, setPosts] = useState([]);
  const [selectedIds, setSelectedIds] = useState(EMPTY_SLOTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        const [postsResponse, settingsResponse] = await Promise.all([
          postsApi.list(),
          settingsApi.get()
        ]);

        const articles = Array.isArray(postsResponse)
          ? postsResponse
          : postsResponse.data || [];

        const settings = settingsResponse.data || settingsResponse;

        const publishedPosts = articles.filter(
          (post) => post.status === 'published'
        );

        if (active) {
          setPosts(publishedPosts);
          setSelectedIds(readSavedStories(settings));
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load homepage settings.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const selectedPosts = useMemo(
    () =>
      selectedIds.map((id) =>
        posts.find((post) => getId(post) === id) || null
      ),
    [selectedIds, posts]
  );

  function handleSelection(index, articleId) {
    setMessage('');
    setError('');

    setSelectedIds((current) => {
      const updated = [...current];

      // Prevent the same article from occupying two positions.
      if (articleId && updated.some(
        (id, i) => i !== index && id === articleId
      )) {
        setError('An article can only be selected once.');
        return current;
      }

      updated[index] = articleId;
      return updated;
    });
  }

  function moveStory(index, direction) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= 5) return;

    setSelectedIds((current) => {
      const updated = [...current];

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index]
      ];

      return updated;
    });

    setMessage('');
  }

  function clearSelection() {
    setSelectedIds(EMPTY_SLOTS);
    setMessage('');
    setError('');
  }

  async function saveLayout() {
    const validIds = selectedIds.filter(Boolean);

    if (validIds.length !== 5) {
      setError('Please select an article for all five positions.');
      return;
    }

    if (new Set(validIds).size !== 5) {
      setError('Please select five different articles.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      await settingsApi.update({
        homepage_stories: JSON.stringify(selectedIds)
      });

      setMessage('Homepage layout saved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save homepage layout.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="homepage-layout-page">
        <p>Loading homepage settings...</p>
      </div>
    );
  }

  return (
    <div className="homepage-layout-page">
      <div className="homepage-layout-header">
        <div>
          <h1>Homepage Layout</h1>
          <p>
            Choose and arrange the five stories displayed on your
            public homepage.
          </p>
        </div>

        <button
          type="button"
          className="save-layout-button"
          onClick={saveLayout}
          disabled={saving || posts.length < 5 || selectedIds.some((id) => !id)}
        >
          {saving ? 'Saving...' : 'Save Homepage Layout'}
        </button>
      </div>

      {error && (
        <div className="layout-alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="layout-alert success">
          {message}
        </div>
      )}

      {posts.length < 5 && (
        <div className="layout-alert warning">
          You need at least five published articles before you can
          configure all homepage positions. Currently available: {posts.length}.
        </div>
      )}

      <div className="homepage-layout-content">
        <section className="story-selection-panel">
          <div className="panel-heading">
            <div>
              <h2>Homepage Stories</h2>
              <p>Select one different article for each position.</p>
            </div>

            <button
              type="button"
              className="clear-selection-button"
              onClick={clearSelection}
            >
              Clear selections
            </button>
          </div>

          <div className="story-slots">
            {SLOT_LABELS.map((label, index) => (
              <div className="story-slot" key={label}>
                <div className="slot-number">
                  {index + 1}
                </div>

                <div className="slot-details">
                  <label htmlFor={`story-${index}`}>
                    {label}
                  </label>

                  <select
                    id={`story-${index}`}
                    value={selectedIds[index]}
                    onChange={(event) =>
                      handleSelection(index, event.target.value)
                    }
                  >
                    <option value="">Choose an article</option>

                    {posts.map((post) => {
                      const id = getId(post);

                      const alreadyUsed = selectedIds.some(
                        (selectedId, selectedIndex) =>
                          selectedId === id && selectedIndex !== index
                      );

                      return (
                        <option
                          key={id}
                          value={id}
                          disabled={alreadyUsed}
                        >
                          {post.title}
                        </option>
                      );
                    })}
                  </select>

                  {selectedPosts[index] && (
                    <span className="selected-category">
                      {selectedPosts[index].category_name || 'GENERAL'}
                    </span>
                  )}
                </div>

                <div className="slot-actions">
                  <button
                    type="button"
                    onClick={() => moveStory(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${label} up`}
                    title="Move up"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() => moveStory(index, 1)}
                    disabled={index === 4}
                    aria-label={`Move ${label} down`}
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="layout-note">
            <strong>How it works:</strong>
            The first position becomes the large main story.
            Positions 2–5 become the four smaller stories.
          </div>
        </section>

        <section className="homepage-preview-panel">
          <h2>Position Preview</h2>
          <p>This is the order your homepage will use.</p>

          <div className="preview-main">
            <span>Main Story</span>
            <h3>{selectedPosts[0]?.title || 'No article selected'}</h3>
          </div>

          <div className="preview-small-grid">
            {selectedPosts.slice(1).map((post, index) => (
              <div className="preview-small" key={index}>
                <span>Story {index + 1}</span>
                <h3>{post?.title || 'No article selected'}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="available-articles-panel">
        <h2>Available Published Articles</h2>
        <p>
          {posts.length} published article(s) available for selection.
        </p>

        {posts.length === 0 ? (
          <p>No published articles are available yet.</p>
        ) : (
          <div className="available-articles-list">
            {posts.map((post) => {
              const selectedIndex = selectedIds.indexOf(getId(post));

              return (
                <div className="available-article" key={getId(post)}>
                  <div>
                    <strong>{post.title}</strong>
                    <span>
                      {post.category_name || 'GENERAL'}
                    </span>
                  </div>

                  {selectedIndex !== -1 && (
                    <span className="selected-badge">
                      Position {selectedIndex + 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
