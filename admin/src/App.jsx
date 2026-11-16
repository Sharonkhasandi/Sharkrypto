import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostsList from './pages/PostsList';
import PostEditor from './pages/PostEditor';
import Categories from './pages/Categories';
import MediaLibrary from './pages/MediaLibrary';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Newsletter from './pages/Newsletter';
import Settings from './pages/Settings';
import HomepageLayout from './pages/HomepageLayout';

import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />

        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:id/edit" element={<PostEditor />} />

        <Route
          path="/homepage-layout"
          element={<HomepageLayout />}
        />

        <Route path="/categories" element={<Categories />} />
        <Route path="/media" element={<MediaLibrary />} />
        <Route path="/users" element={<Users />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/newsletter" element={<Newsletter />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
