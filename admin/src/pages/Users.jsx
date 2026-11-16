
import { useState } from "react";

function Users() {
  const [search, setSearch] = useState("");

  // Real user records will be loaded from the backend.
  const users = [];

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="users-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">ACCESS MANAGEMENT</span>
          <h2>Users</h2>
          <p>Manage registered users and their access permissions.</p>
        </div>
      </div>

      <section className="dashboard-panel users-table-panel">
        <div className="users-toolbar">
          <div>
            <h3>Registered users</h3>
            <p>View and manage accounts on Sharkrypto254.</p>
          </div>

          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>

        <div className="posts-table-wrap">
          <table className="posts-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.role}</td>
                    <td>{user.status}</td>

                    <td>
                      <span className="table-actions">
                        User management actions will be available here.
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-table">
                    <div className="users-empty">
                      <div className="media-empty-icon">♙</div>
                      <h3>No user records available</h3>
                      <p>
                        User accounts will appear here when the backend
                        user-management service is connected.
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

export default Users;
