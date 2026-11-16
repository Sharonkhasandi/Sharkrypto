
function MediaLibrary() {
  // Real media records will be retrieved from the backend.
  const media = [];

  return (
    <div className="media-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">ASSET MANAGEMENT</span>
          <h2>Media library</h2>
          <p>Manage images and visual assets used in your articles.</p>
        </div>
      </div>

      <section className="dashboard-panel media-toolbar">
        <div>
          <h3>All media</h3>
          <p>{media.length} stored files</p>
        </div>
      </section>

      {media.length > 0 ? (
        <div className="media-grid">
          {media.map((item) => (
            <article className="media-card" key={item.id}>
              <div className="media-preview">
                <img src={item.url} alt={item.name} />
              </div>

              <div className="media-card-info">
                <strong>{item.name}</strong>
                <span>{item.size}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="dashboard-panel media-empty">
          <div className="media-empty-icon">▧</div>
          <h3>No media files available</h3>
          <p>
            Your uploaded images and other media files will
            appear here after media storage is connected.
          </p>
        </section>
      )}
    </div>
  );
}

export default MediaLibrary;


