
import { Search, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/icon.png";
import "./Navbar.css";

const navItems = [
  "News",
  "Analysis",
  "Learn",
  "Ranking",
  "Bonus",
  "Gambling",
  "Events",
  "Advertise",
];

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <img
            src={logo}
            alt="Sharkrypto254 logo"
            className="brand-icon"
          />

          <span className="brand-name">
            Sharkrypto<span>254</span>
          </span>
        </Link>

        <nav className="desktop-nav">
          {navItems.map((item) => (
            <Link to={`/${item.toLowerCase()}`} key={item}>
              {item}
              {["News", "Learn", "Ranking"].includes(item) && (
                <ChevronDown size={13} />
              )}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <Link to="/ai-autotrader" className="autotrader-button">
            AI Autotrader
          </Link>

          <button
            type="button"
            className="nav-icon-button"
            aria-label="Search articles"
            title="Search articles"
            onClick={() => navigate("/?search=1")}
          >
            <Search size={19} />
          </button>

          <button type="button" className="language-button">
            <span>🇺🇸</span>
            <span>ENG</span>
            <ChevronDown size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
