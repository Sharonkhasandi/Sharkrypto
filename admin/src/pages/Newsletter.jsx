
import { useState } from "react";

function Newsletter() {
  const [search, setSearch] = useState("");

  // Subscriber records 
  const subscribers = [];

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="newsletter-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">AUDIENCE MANAGEMENT</span>
          <h2>Newsletter</h2>
          <p>Manage people who subscribe to Sharkrypto254 updates.</p>
        </div>
      </div>

      <section className="dashboard-panel newsletter-overview">
        <div>
          <span className="newsletter-overview-icon">✉</span>
          <div>
            <h3>Newsletter subscribers</h3>
            <p>Manage your email audience in one place.</p>
          </div>
        </div>
        <strong>{subscribers.length}</strong>
      </section>

      <section className="dashboard-panel newsletter-table-panel">
        <div className="users-toolbar">
          <div>
            <h3>Subscriber list</h3>
            <p>Registered newsletter email addresses.</p>
          </div>

          <input
            type="search"
            placeholder="Search email addresses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search subscribers"
          />
        </div>

        <div className="posts-table-wrap">
          <table className="posts-table">
            <thead>
              <tr>
                <th>EMAIL ADDRESS</th>
                <th>SUBSCRIPTION DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.subscribedAt}</td>
                    <td>{subscriber.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="empty-table">
                    <div className="newsletter-empty">
                      <div className="media-empty-icon">✉</div>
                      <h3>No subscribers yet</h3>
                      <p>
                        Newsletter subscribers will appear here when
                        the subscription service is connected.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Newsletter;

