import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

import authRoutes       from "./routes/auth.js";
import postsRoutes      from "./routes/posts.js";
import categoriesRoutes from "./routes/categories.js";
import usersRoutes      from "./routes/users.js";
import mediaRoutes      from "./routes/media.js";
import newsletterRoutes from "./routes/newsletter.js";
import analyticsRoutes  from "./routes/analytics.js";
import settingsRoutes   from "./routes/settings.js";
import connectDB from "./db/connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:5173",
    process.env.BLOG_URL   || "http://localhost:5174",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ───────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/posts",      postsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/users",      usersRoutes);
app.use("/api/media",      mediaRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/analytics",  analyticsRoutes);
app.use("/api/settings",   settingsRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// Connect to MongoDB before starting 
await connectDB();

app.listen(PORT, () => {
  console.log(`\n🦈 Sharkrypto254 API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Env:    ${process.env.NODE_ENV || "development"}\n`);
});

