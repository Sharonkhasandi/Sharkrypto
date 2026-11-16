function Analytics() {
  const analytics = null;

  return (
    <div className="analytics-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">PERFORMANCE INSIGHTS</span>
          <h2>Analytics</h2>
          <p>Monitor actual traffic and content performance.</p>
        </div>
      </div>
      {analytics ? (
        <div className="analytics-stats">
          <section className="dashboard-panel analytics-stat">
            <span>Total page views</span>
            <strong>{analytics.pageViews}</strong>
          </section>

          <section className="dashboard-panel analytics-stat">
            <span>Unique visitors</span>
            <strong>{analytics.uniqueVisitors}</strong>
          </section>

          <section className="dashboard-panel analytics-stat">
            <span>Published articles</span>
            <strong>{analytics.publishedArticles}</strong>
          </section>
        </div>
      ) : (
        <section className="dashboard-panel analytics-empty">
          <div className="media-empty-icon">↗</div>
          <h3>Analytics data is not connected</h3>
          <p>
            Website traffic and engagement statistics will appear here
            after the analytics service and backend are connected.
          </p>
        </section>
      )}
    </div>
  );
}

export default Analytics;
