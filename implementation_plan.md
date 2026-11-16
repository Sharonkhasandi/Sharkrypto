# Admin Management Portal for Sharkrypto254

Build a full-featured admin dashboard inside the `sha admin portal` directory for managing the Sharkrypto254 blogging platform.

## Background

The Sharkrypto254 blog (`/sharkrypto254/sharkrypto254/`) is a Vite + React app with a dark navy crypto-themed design. The admin portal will be a **separate Vite + React app** in `/sha admin portal/` with a cohesive dark premium design system.

---

## Proposed Changes

### 1. Project Setup

#### [NEW] `sha admin portal/` — Full Vite + React Project

- Initialize with `npx -y create-vite@latest ./ --template react`
- Install `react-router-dom` for multi-page routing
- Port the same design tokens (colors, fonts, radii) from the blog for brand consistency
- The admin portal will run on its own dev server (separate port from the blog)

---

### 2. Design System & Layout

#### [NEW] `src/index.css` — Global design tokens & reset
- Reuse blog design tokens: `--color-bg: #060d1b`, gold accents, Inter font
- Add admin-specific tokens: sidebar widths, form styles, table styles
- Admin-specific dark glass cards, stat cards, and form elements

#### [NEW] `src/components/Sidebar.jsx` + `Sidebar.css`
- Collapsible sidebar navigation with:
  - **Dashboard** (home icon)
  - **Posts** (article icon) — with sub-items: All Posts, New Post
  - **Categories** (folder icon)
  - **Media** (image icon)
  - **Users** (people icon)
  - **Analytics** (chart icon)
  - **Newsletter** (mail icon)
  - **SEO** (search icon)
  - **Settings** (gear icon)
- Active state highlighting, hover animations
- Collapse/expand toggle
- Brand logo at the top

#### [NEW] `src/components/TopBar.jsx` + `TopBar.css`
- Search bar, notification bell, admin avatar/dropdown
- Quick actions (New Post button)
- Breadcrumb navigation

#### [NEW] `src/components/AdminLayout.jsx`
- Shared layout wrapper: Sidebar + TopBar + main content area
- Responsive: sidebar collapses to icons on smaller screens

---

### 3. Pages

#### [NEW] `src/pages/Dashboard.jsx` + `Dashboard.css`
- **Stat Cards Row**: Total Posts, Total Views, Subscribers, Active Users — with sparkline trends
- **Recent Activity Feed**: Latest published/edited posts timeline
- **Quick Actions**: New Post, View Site, Moderate Comments
- **Traffic Chart**: Area/line chart (CSS-based or simple SVG) showing weekly views
- **Top Performing Posts** table: Title, Views, Category, Status

#### [NEW] `src/pages/PostsList.jsx` + `PostsList.css`
- Data table of all blog posts with columns: Title, Category, Status (Published/Draft/Scheduled), Date, Views, Actions
- Bulk actions toolbar: Delete, Change Status, Export
- Search & filter (by category, status, date range)
- Pagination controls
- Sortable columns

#### [NEW] `src/pages/PostEditor.jsx` + `PostEditor.css`
- Rich text editor area (textarea with formatting toolbar)
- Side panel with:
  - **Publish settings**: Status, Schedule date, Visibility
  - **Category** selector
  - **Tags** input (chips)
  - **Featured Image** upload area
  - **SEO Preview**: Title, Meta description, URL slug
  - **Excerpt** field
- Auto-save indicator
- Preview button

#### [NEW] `src/pages/Categories.jsx` + `Categories.css`
- List/grid of categories with post counts
- Add/Edit/Delete category modals
- Category color picker
- Drag-to-reorder

#### [NEW] `src/pages/MediaLibrary.jsx` + `MediaLibrary.css`
- Grid of uploaded images with preview thumbnails
- Upload dropzone
- Filter by type (images, documents)
- Image details panel (filename, size, alt text, URL)

#### [NEW] `src/pages/Users.jsx` + `Users.css`
- User table: Name, Email, Role (Admin/Editor/Author), Last Active, Status
- Add/Edit user modal

#### [NEW] `src/pages/Analytics.jsx` + `Analytics.css`
- Traffic overview chart (CSS-based)
- Top pages table
- Referral sources
- Device/browser breakdown
- Date range picker

#### [NEW] `src/pages/Newsletter.jsx` + `Newsletter.css`
- Subscriber list with search
- Compose/send newsletter form
- Campaign history table
- Subscriber growth chart

#### [NEW] `src/pages/Settings.jsx` + `Settings.css`
- General: Site title, description, logo upload
- SEO: Default meta tags, robots.txt config, sitemap
- Appearance: Theme color picker
- Integrations: API keys, social media connections
- Tabbed interface

#### [NEW] `src/pages/Login.jsx` + `Login.css`
- Premium dark login page with:
  - Brand logo
  - Email & password fields
  - "Remember me" checkbox
  - Login button with gradient
  - Glassmorphism card

---

### 4. Shared Components

#### [NEW] `src/components/StatCard.jsx`
- Reusable stat card with icon, value, label, trend indicator

#### [NEW] `src/components/DataTable.jsx`
- Reusable sortable/filterable table component

#### [NEW] `src/components/Modal.jsx`
- Reusable modal dialog with backdrop blur

#### [NEW] `src/components/StatusBadge.jsx`
- Color-coded status badges (Published, Draft, Scheduled, Active, Inactive)

#### [NEW] `src/components/ChartBar.jsx`
- Simple CSS-based bar/area chart component

---

### 5. Routing

#### [NEW] `src/App.jsx`
```
/login          → Login
/               → Dashboard
/posts          → PostsList
/posts/new      → PostEditor
/posts/:id/edit → PostEditor
/categories     → Categories
/media          → MediaLibrary
/users          → Users
/analytics      → Analytics
/newsletter     → Newsletter
/settings       → Settings
```

---

## User Review Required

> [!IMPORTANT]
> The admin portal will be a **separate Vite project** in the `sharkrypto admin portal/` directory. It will share the same design language (dark navy, gold accents, Inter font) but run independently from the blog. Is this the intended structure?

> [!IMPORTANT]
> This will be a **frontend-only** implementation with mock/static data. No backend API or database will be connected. All data (posts, users, etc.) will be hardcoded sample data. Should I also set up a backend, or is frontend-only acceptable for now?


---

## Verification Plan

### Automated Tests
- Run `npm run dev` and verify all routes load without errors
- Browser screenshot verification of each major page

### Manual Verification
- Navigate through all sidebar links
- Test responsive layout (sidebar collapse)
- Verify dark theme consistency across all pages
- Check animations and hover effects
