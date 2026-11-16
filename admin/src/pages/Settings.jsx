
import { useState } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    siteName: "Sharkrypto254",
    siteDescription: "",
    siteUrl: "",
    contactEmail: "",
    articlesPerPage: "10",
    timezone: "Africa/Nairobi",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Persistence will be implemented through the backend.
    setMessage("Settings are not connected to the backend yet.");
  };

  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <span className="dashboard-eyebrow">CONFIGURATION</span>
          <h2>Settings</h2>
          <p>Configure your website's general preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <section className="dashboard-panel settings-section">
          <div className="panel-heading">
            <div>
              <h3>General settings</h3>
              <p>Basic information about your publication.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label className="editor-label">
              Website name
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="editor-label">
              Website description
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Describe your publication..."
              />
            </label>

            <label className="editor-label">
              Website URL
              <input
                type="url"
                name="siteUrl"
                value={settings.siteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </label>

            <label className="editor-label">
              Contact email
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                placeholder="Enter contact email"
              />
            </label>
          </div>
        </section>

        <section className="dashboard-panel settings-section">
          <div className="panel-heading">
            <div>
              <h3>Publishing preferences</h3>
              <p>Control how articles are presented.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label className="editor-label">
              Articles per page
              <select
                name="articlesPerPage"
                value={settings.articlesPerPage}
                onChange={handleChange}
              >
                <option value="5">5 articles</option>
                <option value="10">10 articles</option>
                <option value="15">15 articles</option>
                <option value="20">20 articles</option>
              </select>
            </label>

            <label className="editor-label">
              Timezone
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
              >
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </label>
          </div>
        </section>

        <div className="settings-footer">
          {message && <p className="editor-message">{message}</p>}

          <button type="submit" className="primary-action">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;

