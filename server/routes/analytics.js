
import { Router } from "express";
import Post from "../models/Post.js";
import Category from "../models/Category.js";
import Subscriber from "../models/Subscriber.js";
import User from "../models/User.js";
import Media from "../models/Media.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/analytics/overview
router.get("/overview", requireAuth, async (req, res) => {
  try {
    const [
      posts,
      published,
      drafts,
      scheduled,
      views,
      subscribers,
      users,
      media,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "draft" }),
      Post.countDocuments({ status: "scheduled" }),
      Post.aggregate([
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Subscriber.countDocuments({ status: "active" }),
      User.countDocuments({ status: "active" }),
      Media.countDocuments(),
    ]);

    res.json({
      posts,
      published,
      drafts,
      scheduled,
      total_views: views[0]?.total || 0,
      subscribers,
      active_users: users,
      media_files: media,
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /api/analytics/top-posts
router.get("/top-posts", requireAuth, async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const posts = await Post.find({ status: "published" })
      .sort({ views: -1 })
      .limit(limit)
      .populate("category", "name color")
      .lean();

    const rows = posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      views: post.views,
      published_at: post.publishedAt,
      status: post.status,
      category_name: post.category?.name || null,
      category_color: post.category?.color || null,
    }));

    res.json(rows);
  } catch (err) {
    console.error("Top posts analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /api/analytics/posts-by-category
router.get("/posts-by-category", requireAuth, async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "category",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          color: 1,
          post_count: { $size: "$posts" },
          total_views: { $sum: "$posts.views" },
        },
      },
      { $sort: { total_views: -1 } },
    ]);

    res.json(categories);
  } catch (err) {
    console.error("Posts by category analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /api/analytics/recent-posts
router.get("/recent-posts", requireAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("author", "name")
      .lean();

    const rows = posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      status: post.status,
      views: post.views,
      updated_at: post.updatedAt,
      author_name: post.author?.name || "Unknown",
    }));

    res.json(rows);
  } catch (err) {
    console.error("Recent posts analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;