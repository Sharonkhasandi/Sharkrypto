
import { useState } from "react";
import {
  NavLink,
  Outlet,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const {
    user,
    isAuthenticated,
    logout,
    loading,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Wait until the backend verifies the saved session.
  if (loading) {
    return (
      <div className="admin-loading">
        Verifying your session...
      </div>
    );
  }

  // Redirect users who are not logged in.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigation = [
    {
      label: "MAIN MENU",
      items: [
        {
          name: "Dashboard",
          path: "/",
          icon: "⌂",
        },
        {
          name: "Homepage Layout",
          path: "/homepage-layout",
          icon: "▦",
          },
        
        {
          name: "Articles",
          path: "/posts",
          icon: "▤",
        },
        {
          name: "Homepage Layout",
          path: "/homepage-layout",
          icon: "▦",
        },
        {
          name: "Categories",
          path: "/categories",
          icon: "▦",
        },
        {
          name: "Media Library",
          path: "/media",
          icon: "▧",
        },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          name: "Users",
          path: "/users",
          icon: "♙",
        },
        {
          name: "Analytics",
          path: "/analytics",
          icon: "▥",
        },
        {
          name: "Newsletter",
          path: "/newsletter",
          icon: "✉",
        },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        {
          name: "Settings",
          path: "/settings",
          icon: "⚙",
        },
      ],
    },
  ];

  return (
    <div className="admin-layout">

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-mark">S</div>

          <div className="brand-text">
            <h2>SHARKRYPTO</h2>
            <span>ADMIN PORTAL</span>
          </div>
        </div>

        <div className="sidebar-navigation">
          {navigation.map((group) => (
            <div
              className="nav-group"
              key={group.label}
            >
              <p className="nav-group-label">
                {group.label}
              </p>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `sidebar-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <span className="sidebar-icon">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>

            <div className="user-details">
              <strong>
                {user?.name || "Administrator"}
              </strong>

              <span>
                {user?.role || "Admin"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen((current) => !current)
            }
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div className="topbar-breadcrumb">
            <span>Sharkrypto254</span>
            <span>/</span>
            <strong>Admin Portal</strong>
          </div>

          <div className="topbar-user">
            <span>
              {user?.name || "Administrator"}
            </span>

            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
