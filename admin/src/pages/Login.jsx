import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      // The backend verifies the actual credentials.
      await login(email.trim(), password);

      const destination = location.state?.from?.pathname || "/";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.message || "Invalid email or password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />
        <div className="login-grid" />
      </div>

      <section className="login-container">

        <Link to="/login" className="login-brand">
          <div className="login-brand-icon">S</div>

          <div className="login-brand-text">
            <h1>
              SHARKRYPTO<span>254</span>
            </h1>
            <p>INDEPENDENT DIGITAL INTELLIGENCE</p>
          </div>
        </Link>

        <div className="login-card">

          <div className="login-card-top">
            <div className="login-security-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2.75L19 5.5V11.2C19 16 16.1 19.1 12 21.25C7.9 19.1 5 16 5 11.2V5.5L12 2.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 11.8L11 13.8L15.5 9.3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className="login-secure-label">
              SECURE ADMIN ACCESS
            </span>
          </div>

          <div className="login-heading">
            <h2>Welcome back.</h2>
            <p>
              Sign in to access your Sharkrypto254 administration
              dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            <div className="login-field">
              <label htmlFor="login-email">
                Email address
              </label>

              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M4 7L12 13L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-password-heading">
                <label htmlFor="login-password">
                  Password
                </label>
              </div>

              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 10V7A4 4 0 0116 7V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="15.5"
                      r="1"
                      fill="currentColor"
                    />
                  </svg>
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span className="login-error-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="login-spinner" />
                  Verifying credentials...
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <span className="login-submit-arrow">→</span>
                </>
              )}
            </button>

          </form>

          <div className="login-divider">
            <span />
            <p>AUTHORIZED PERSONNEL ONLY</p>
            <span />
          </div>

          <div className="login-card-footer">
            <span className="login-status-dot" />
            <span>Protected administration environment</span>
          </div>

        </div>

        <footer className="login-footer">
          <p>
            © {new Date().getFullYear()} Sharkrypto254.
            All rights reserved.
          </p>

          <p>
            Cryptocurrency <span>·</span> Technology <span>·</span> Intelligence
          </p>
        </footer>

      </section>
    </main>
  );
}

export default Login;
