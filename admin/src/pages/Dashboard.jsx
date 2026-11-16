import { Link } from "react-router-dom";

function Dashboard() {
  const dashboardData = null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
          <h2>Welcome to Sharkrypto254</h2>
          <p>Manage your crypto and technology publication.</p>
        </div>

        <Link to="/posts/new" className="primary-action">
          + Create article
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span>Total articles</span>
            <span className="stat-icon">▤</span>
          </div>
          <strong>{dashboardData?.totalArticles ?? "—"}</strong>
          <span>Awaiting database connection</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Published articles</span>
            <span className="stat-icon">◉</span>
          </div>
          <strong>{dashboardData?.publishedArticles ?? "—"}</strong>
          <span>Awaiting database connection</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Draft articles</span>
            <span className="stat-icon">✎</span>
          </div>
          <strong>{dashboardData?.draftArticles ?? "—"}</strong>
          <span>Awaiting database connection</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span>Newsletter subscribers</span>
            <span className="stat-icon">✉</span>
          </div>
          <strong>{dashboardData?.subscribers ?? "—"}</strong>
          <span>Awaiting database connection</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel recent-posts-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent articles</h3>
              <p>Your latest published and draft articles.</p>
            </div>

            <Link to="/posts">View all</Link>
          </div>

          <div className="dashboard-empty">
            <div className="media-empty-icon">▤</div>
            <h3>No articles available</h3>
            <p>
              Articles will appear here when they are created
              and retrieved from the database.
            </p>
            <Link to="/posts/new" className="secondary-action">
              Create your first article
            </Link>
          </div>
        </section>

        <section className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Quick actions</h3>
              <p>Manage your publication.</p>
            </div>
          </div>

          <div className="quick-actions">
            <Link to="/posts/new" className="quick-action">
              <span className="quick-action-icon">✎</span>
              <span>Create article</span>
              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/posts" className="quick-action">
              <span className="quick-action-icon">▤</span>
              <span>Manage articles</span>
              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/media" className="quick-action">
              <span className="quick-action-icon">▧</span>
              <span>Media library</span>
              <span className="quick-arrow">→</span>
            </Link>

            <Link to="/newsletter" className="quick-action">
              <span className="quick-action-icon">✉</span>
              <span>Newsletter</span>
              <span className="quick-arrow">→</span>
            </Link>
          </div>
        </section>
      </div>

      <div className="dashboard-version">
        <span className="status-dot" />
        Sharkrypto254 Content Management System
      </div>
    </div>
  );
}

export default Dashboard;

