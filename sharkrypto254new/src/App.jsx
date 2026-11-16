import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import MarketTicker from "./components/MarketTicker";
import Home from "./pages/Home";
import News from "./pages/News";
import BlogPost from "./pages/BlogPost";

function NotFound() {
  return (
    <main className="container" style={{ padding: "80px 0" }}>
      <h1>Page not found</h1>
      <p>This page is not available yet.</p>
    </main>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <MarketTicker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/category/:slug" element={<NotFound />} />
        <Route path="/about" element={<NotFound />} />
        <Route path="/contact" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
